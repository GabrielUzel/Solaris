defmodule SolarisCore.Infrastructure.MarketData.FinnhubClient do
  alias SolarisCore.Infrastructure.MarketData.HttpClient
  alias SolarisCore.Infrastructure.MarketData.PriceConverter

  @type quote :: %{price_cents: integer(), quoted_at: Date.t()}
  @type candle_point :: %{date: Date.t(), close_cents: integer()}

  @spec fetch_quote(String.t()) :: {:ok, quote()} | {:error, term()}
  def fetch_quote(symbol) do
    with {:ok, body} <- get("/quote", %{symbol: symbol}),
         {:ok, price} <- extract_current_price(body) do
      {:ok, %{price_cents: PriceConverter.to_cents(price), quoted_at: quoted_at(body)}}
    end
  end

  @spec fetch_candles(String.t(), Date.t(), Date.t()) ::
          {:ok, [candle_point()]} | {:error, term()}
  def fetch_candles(symbol, from_date, to_date) do
    params = %{
      symbol: symbol,
      resolution: "D",
      from: from_date |> DateTime.new!(~T[00:00:00], "Etc/UTC") |> DateTime.to_unix(),
      to: to_date |> DateTime.new!(~T[23:59:59], "Etc/UTC") |> DateTime.to_unix()
    }

    with {:ok, body} <- get("/stock/candle", params, historical: true),
         :ok <- ensure_candle_status(body) do
      parse_candles(body)
    end
  end

  defp get(path, params, opts \\ []) do
    with {:ok, api_key} <- api_key() do
      url = base_url() <> path <> "?" <> URI.encode_query(params)
      headers = [{"x-finnhub-token", api_key}]

      case HttpClient.get(url, headers) do
        {:ok, 200, body} ->
          decode_body(body)

        {:ok, 429, _body} ->
          {:error, :rate_limited}

        {:ok, status, _body} when status in [401, 403] ->
          if Keyword.get(opts, :historical, false),
            do: {:error, :historical_unavailable},
            else: {:error, :unauthorized}

        {:ok, 404, _body} ->
          {:error, :not_found}

        {:ok, status, _body} ->
          {:error, {:unexpected_status, status}}

        {:error, reason} ->
          {:error, reason}
      end
    end
  end

  defp api_key do
    case System.get_env("FINNHUB_API_KEY") do
      key when is_binary(key) and byte_size(key) > 0 -> {:ok, key}
      _missing -> {:error, :missing_finnhub_api_key}
    end
  end

  defp base_url do
    :solaris_core
    |> Application.get_env(:finnhub, [])
    |> Keyword.get(:base_url, "https://finnhub.io/api/v1")
  end

  defp decode_body(body) do
    case Jason.decode(body) do
      {:ok, decoded} -> {:ok, decoded}
      {:error, _decode_error} -> {:error, :invalid_json}
    end
  end

  defp extract_current_price(%{"c" => price}) when price in [0, 0.0], do: {:error, :not_found}
  defp extract_current_price(%{"c" => price}), do: {:ok, price}
  defp extract_current_price(_unexpected), do: {:error, :unexpected_payload}

  defp quoted_at(%{"t" => unix}) when is_integer(unix) and unix > 0 do
    unix |> DateTime.from_unix!() |> DateTime.to_date()
  end

  defp quoted_at(_body), do: Date.utc_today()

  defp ensure_candle_status(%{"s" => "ok"}), do: :ok
  defp ensure_candle_status(%{"s" => "no_data"}), do: {:error, :no_data}
  defp ensure_candle_status(_unexpected), do: {:error, :unexpected_payload}

  defp parse_candles(%{"c" => closes, "t" => timestamps})
       when is_list(closes) and is_list(timestamps) do
    closes
    |> Enum.zip(timestamps)
    |> Enum.map(fn
      {close, unix} when is_number(close) and is_integer(unix) ->
        %{
          date: unix |> DateTime.from_unix!() |> DateTime.to_date(),
          close_cents: PriceConverter.to_cents(close)
        }

      _null_point ->
        nil
    end)
    |> Enum.reject(&is_nil/1)
    |> case do
      [] -> {:error, :no_data}
      points -> {:ok, points}
    end
  end

  defp parse_candles(_unexpected), do: {:error, :unexpected_payload}
end
