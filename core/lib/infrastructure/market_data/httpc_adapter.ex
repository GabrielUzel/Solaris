defmodule SolarisCore.Infrastructure.MarketData.HttpcAdapter do
  @behaviour SolarisCore.Infrastructure.MarketData.HttpClient

  require Logger

  @timeout_ms 15_000

  @impl true
  def get(url, headers) do
    {:ok, _} = Application.ensure_all_started(:inets)
    {:ok, _} = Application.ensure_all_started(:ssl)

    request = {String.to_charlist(url), to_httpc_headers(headers)}

    case :httpc.request(:get, request, [timeout: @timeout_ms], body_format: :binary) do
      {:ok, {{_version, status, _reason}, _response_headers, body}} ->
        {:ok, status, body}

      {:error, reason} ->
        Logger.warning("Falha na requisicao HTTP de dados de mercado: #{inspect(reason)}")
        {:error, {:http_request_failed, reason}}
    end
  end

  defp to_httpc_headers(headers) do
    Enum.map(headers, fn {key, value} ->
      {String.to_charlist(key), String.to_charlist(value)}
    end)
  end
end
