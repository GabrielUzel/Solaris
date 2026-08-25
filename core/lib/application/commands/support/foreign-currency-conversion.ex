defmodule SolarisCore.Application.Commands.Support.ForeignCurrencyConversion do
  @moduledoc """
  Conversao cambial compartilhada pelos commands de entrada (compra e
  reinvestimento).

  A entrada do usuario e sempre em centavos de BRL. Quando o ativo e cotado em
  USD, a cotacao USD/BRL da `transaction_date` e obtida via
  `ExchangeRateProvider` (cache-first) e persistida na transacao — ela nunca
  e recalculada depois. Para ativos em BRL, os campos cambiais ficam `nil`.

  O provider pode ser sobrescrito via `opts[:exchange_rate_provider]`
  (util em testes); por padrao usa `config :solaris_core, :exchange_rate_provider`.
  """

  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Finance.Domain.InvestmentRules

  @type currency_attrs :: %{
          exchange_rate_used: Decimal.t() | nil,
          amount_invested_usd_cents: integer() | nil
        }

  @spec currency_attrs(Asset.t(), integer(), Date.t(), keyword()) ::
          {:ok, currency_attrs()} | {:error, term()}
  def currency_attrs(asset, amount_invested_cents, transaction_date, opts \\ [])

  def currency_attrs(%Asset{currency: :BRL}, _amount_invested_cents, _transaction_date, _opts) do
    {:ok, %{exchange_rate_used: nil, amount_invested_usd_cents: nil}}
  end

  def currency_attrs(%Asset{currency: :USD}, amount_invested_cents, transaction_date, opts) do
    with {:ok, provider} <- exchange_rate_provider(opts),
         {:ok, rate} <- provider.fetch_rate("USD-BRL", transaction_date) do
      usd_cents = InvestmentRules.convert_brl_to_usd_cents(amount_invested_cents, rate)
      {:ok, %{exchange_rate_used: rate, amount_invested_usd_cents: usd_cents}}
    end
  end

  defp exchange_rate_provider(opts) do
    provider =
      Keyword.get(opts, :exchange_rate_provider) ||
        Application.get_env(:solaris_core, :exchange_rate_provider)

    if is_nil(provider), do: {:error, :exchange_rate_provider_not_configured}, else: {:ok, provider}
  end
end
