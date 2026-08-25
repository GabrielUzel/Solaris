defmodule SolarisCore.Infrastructure.MarketData.HttpClient do
  @type headers :: [{String.t(), String.t()}]

  @callback get(url :: String.t(), headers :: headers()) ::
              {:ok, status :: non_neg_integer(), body :: String.t()} | {:error, term()}

  @spec get(String.t(), headers()) :: {:ok, non_neg_integer(), String.t()} | {:error, term()}
  def get(url, headers \\ []) do
    adapter().get(url, headers)
  end

  defp adapter do
    :solaris_core
    |> Application.get_env(:market_data, [])
    |> Keyword.get(:http_adapter, SolarisCore.Infrastructure.MarketData.HttpcAdapter)
  end
end
