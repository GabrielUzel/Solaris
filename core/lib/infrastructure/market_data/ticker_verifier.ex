defmodule SolarisCore.Infrastructure.MarketData.TickerVerifier do
  @moduledoc """
  Verifica se um ticker existe na fonte de precos externa antes do cadastro.

  Renda fixa e fontes manuais (manual_curve, brapi_treasury) nao passam por
  validacao, pois nao possuem coticacao de mercado convencional.
  """

  alias SolarisCore.Infrastructure.MarketData.BrapiClient
  alias SolarisCore.Infrastructure.MarketData.FinnhubClient

  @manual_sources [:manual_curve, :brapi_treasury]

  @spec verify(map()) :: :ok | {:error, atom()}
  def verify(%{asset_type: :fixed_income}), do: :ok

  def verify(%{price_source: source}) when source in @manual_sources, do: :ok

  def verify(%{market: :b3, external_symbol: ext, ticker: ticker}) do
    symbol = ext || ticker
    BrapiClient.fetch_current_quote(symbol)
    |> verify_response()
  end

  def verify(%{market: :us_market, external_symbol: ext, ticker: ticker}) do
    symbol = ext || ticker
    FinnhubClient.fetch_quote(symbol)
    |> verify_response()
  end

  def verify(_attrs), do: :ok

  defp verify_response({:ok, _}), do: :ok
  defp verify_response({:error, :not_found}), do: {:error, :ticker_not_found}
  defp verify_response({:error, :unauthorized}), do: {:error, :brapi_key_not_configured}
  defp verify_response({:error, :brapi_key_not_configured}), do: {:error, :brapi_key_not_configured}
  defp verify_response({:error, :finnhub_key_not_configured}), do: {:error, :finnhub_key_not_configured}
  defp verify_response({:error, :rate_limited}), do: {:error, :ticker_validation_unavailable}
  defp verify_response({:error, _}), do: {:error, :ticker_validation_unavailable}
end
