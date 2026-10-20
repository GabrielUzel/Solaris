defmodule SolarisCore.Infrastructure.MarketData.BrapiClient do
  require Logger

  alias SolarisCore.Infrastructure.MarketData.HttpClient
  alias SolarisCore.Infrastructure.MarketData.PriceConverter
  alias SolarisCore.Infrastructure.Repositories.AppSettingRepo

  @type price_point :: %{date: Date.t(), close_cents: integer()}
  @type indicator_point :: %{date: Date.t(), value: Decimal.t()}
  @type rate_point :: %{date: Date.t(), rate: Decimal.t()}

  @spec fetch_current_quote(String.t()) :: {:ok, integer()} | {:error, term()}
  def fetch_current_quote(symbol) do
    with {:ok, body} <- get("/api/v2/stocks/quote", %{symbols: symbol}),
         {:ok, result} <- first_result(body),
         price_cents when not is_nil(price_cents) <-
           result |> extract_price() |> PriceConverter.to_cents() do
      {:ok, price_cents}
    else
      nil -> {:error, :unexpected_payload}
      error -> error
    end
  end

  @spec fetch_stock_historical(String.t(), Date.t(), Date.t()) ::
          {:ok, [price_point()]} | {:error, term()}
  def fetch_stock_historical(symbol, start_date, end_date) do
    fetch_historical_series("/api/v2/stocks/historical", symbol, start_date, end_date)
  end

  @spec fetch_fii_historical(String.t(), Date.t(), Date.t()) ::
          {:ok, [price_point()]} | {:error, term()}
  def fetch_fii_historical(symbol, start_date, end_date) do
    fetch_historical_series("/api/v2/fii/historical", symbol, start_date, end_date)
  end

  @spec fetch_macro_indicator(String.t(), Date.t(), Date.t()) ::
          {:ok, [indicator_point()]} | {:error, term()}
  def fetch_macro_indicator(indicator, start_date, end_date) do
    params = %{
      indicator: indicator,
      startDate: Date.to_iso8601(start_date),
      endDate: Date.to_iso8601(end_date)
    }

    with {:ok, body} <- get("/api/v2/macro", params),
         {:ok, result} <- first_result(body),
         data when is_list(data) <- Map.get(result, "data") do
      parse_series(data, &parse_indicator_point/1)
    else
      nil -> {:error, :unexpected_payload}
      error -> error
    end
  end

  @spec fetch_latest_macro_indicator(String.t()) ::
          {:ok, Decimal.t()} | {:error, term()}
  def fetch_latest_macro_indicator(indicator) do
    with {:ok, body} <- get("/api/v2/macro/latest", %{indicator: indicator}),
         {:ok, result} <- first_result(body),
         value when not is_nil(value) <-
           result |> extract_value() |> PriceConverter.to_decimal() do
      {:ok, value}
    else
      nil -> {:error, :unexpected_payload}
      error -> error
    end
  end

  @spec fetch_currency_rate(String.t()) ::
          {:ok, Decimal.t()} | {:error, term()}
  def fetch_currency_rate(pair \\ "USD-BRL") do
    with {:ok, body} <- get("/api/v2/currency", %{currency: pair}),
         {:ok, result} <- first_result(body),
         rate when not is_nil(rate) <-
           result |> extract_rate() |> PriceConverter.to_decimal() do
      {:ok, rate}
    else
      nil -> {:error, :unexpected_payload}
      error -> error
    end
  end

  @spec fetch_currency_historical(String.t(), Date.t(), Date.t()) ::
          {:ok, [rate_point()]} | {:error, term()}
  def fetch_currency_historical(pair, start_date, end_date) do
    params = %{
      currency: pair,
      startDate: Date.to_iso8601(start_date),
      endDate: Date.to_iso8601(end_date)
    }

    with {:ok, body} <- get("/api/v2/currency/historical", params),
         {:ok, result} <- first_result(body),
         data when is_list(data) <- Map.get(result, "data") do
      parse_series(data, &parse_rate_point/1)
    else
      nil -> {:error, :unexpected_payload}
      error -> error
    end
  end

  defp fetch_historical_series(path, symbol, start_date, end_date) do
    params = %{
      symbols: symbol,
      startDate: Date.to_iso8601(start_date),
      endDate: Date.to_iso8601(end_date)
    }

    with {:ok, body} <- get(path, params),
         {:ok, result} <- first_result(body),
         {:ok, data} <- extract_price_list(result),
         {:ok, points} <- parse_series(data, &parse_price_point/1) do
      {:ok, Enum.sort_by(points, & &1.date, Date)}
    end
  end

  defp get(path, params) do
    case api_token() do
      {:ok, token} ->
        url = base_url() <> path <> "?" <> URI.encode_query(params)
        headers = [{"authorization", "Bearer " <> token}]

        case HttpClient.get(url, headers) do
          {:ok, 200, body} ->
            decode_body(body)

          {:ok, status, _body} when status in [401, 403] ->
            {:error, :unauthorized}

          {:ok, 404, _body} ->
            {:error, :not_found}

          {:ok, 429, _body} ->
            Logger.warning("[BrapiClient] brapi respondeu HTTP 429 (limite de requisicoes)")

            {:error, :rate_limited}

          {:ok, status, _body} ->
            {:error, {:unexpected_status, status}}

          {:error, reason} ->
            {:error, reason}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp api_token do
    case AppSettingRepo.get("brapi_token") do
      {:ok, %{value: token}}
      when is_binary(token) and byte_size(token) > 0 ->
        {:ok, token}

      _ ->
        {:error, :brapi_key_not_configured}
    end
  end

  defp base_url do
    :solaris_core
    |> Application.get_env(:brapi, [])
    |> Keyword.get(:base_url, "https://brapi.dev")
  end

  defp decode_body(body) do
    case Jason.decode(body) do
      {:ok, decoded} ->
        {:ok, decoded}

      {:error, _decode_error} ->
        Logger.error("[BrapiClient] falha ao decodificar JSON da resposta")

        {:error, :invalid_json}
    end
  end

  defp first_result(%{"results" => [%{"data" => data} | _rest]})
       when is_map(data) do
    {:ok, data}
  end

  defp first_result(%{"results" => [first | _rest]}) when is_map(first) do
    {:ok, first}
  end

  defp first_result(%{"results" => []}), do: {:error, :not_found}
  defp first_result(_unexpected), do: {:error, :unexpected_payload}

  defp extract_price_list(result) do
    case Map.get(result, "historicalDataPrice") || Map.get(result, "data") do
      data when is_list(data) -> {:ok, data}
      _ -> {:error, :unexpected_payload}
    end
  end

  defp extract_price(map) when is_map(map) do
    Map.get(map, "close") ||
      Map.get(map, "regularMarketPrice") ||
      Map.get(map, "price")
  end

  defp extract_value(map) when is_map(map) do
    Map.get(map, "value") ||
      Map.get(map, "rate") ||
      Map.get(map, "close")
  end

  defp extract_rate(map) when is_map(map) do
    Map.get(map, "bid") ||
      Map.get(map, "rate") ||
      Map.get(map, "close")
  end

  defp parse_series(data, parser) do
    case data |> Enum.map(parser) |> Enum.reject(&is_nil/1) do
      [] -> {:error, :no_data}
      points -> {:ok, points}
    end
  end

  defp parse_price_point(point) when is_map(point) do
    with {:ok, date} <- parse_date(Map.get(point, "date")),
         close_cents when not is_nil(close_cents) <-
           point |> extract_price() |> PriceConverter.to_cents() do
      %{date: date, close_cents: close_cents}
    else
      _invalid -> nil
    end
  end

  defp parse_price_point(_unexpected), do: nil

  defp parse_indicator_point(point) when is_map(point) do
    with {:ok, date} <- parse_date(Map.get(point, "date")),
         value when not is_nil(value) <-
           point |> extract_value() |> PriceConverter.to_decimal() do
      %{date: date, value: value}
    else
      _invalid -> nil
    end
  end

  defp parse_indicator_point(_unexpected), do: nil

  defp parse_rate_point(point) when is_map(point) do
    with {:ok, date} <- parse_date(Map.get(point, "date")),
         rate when not is_nil(rate) <-
           point |> extract_rate() |> PriceConverter.to_decimal() do
      %{date: date, rate: rate}
    else
      _invalid -> nil
    end
  end

  defp parse_rate_point(_unexpected), do: nil

  defp parse_date(%Date{} = date), do: {:ok, date}

  defp parse_date(unix) when is_integer(unix) do
    {:ok, unix |> DateTime.from_unix!() |> DateTime.to_date()}
  end

  defp parse_date(iso) when is_binary(iso) do
    with {:error, _date_error} <- Date.from_iso8601(iso),
         {:error, _naive_error} <- NaiveDateTime.from_iso8601(iso) do
      case DateTime.from_iso8601(iso) do
        {:ok, datetime, _offset} ->
          {:ok, DateTime.to_date(datetime)}

        {:error, _datetime_error} ->
          :error
      end
    else
      {:ok, %Date{} = date} ->
        {:ok, date}

      {:ok, %NaiveDateTime{} = naive} ->
        {:ok, NaiveDateTime.to_date(naive)}
    end
  end

  defp parse_date(_unexpected), do: :error
end
