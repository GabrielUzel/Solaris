defmodule SolarisCore.Application.Commands.AddReinvestment do
  alias Ecto.UUID
  alias SolarisCore.Application.Commands.Support.ForeignCurrencyConversion
  alias SolarisCore.Finance.Domain.Investment
  alias SolarisCore.Finance.Domain.InvestmentTransaction
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo

  @spec execute(map(), keyword()) :: {:ok, InvestmentTransaction.t()} | {:error, term()}
  def execute(attrs, opts \\ []) do
    with {:ok, investment} <- InvestmentRepo.get(attrs[:investment_id]),
         :ok <- ensure_open(investment),
         {:ok, asset} <- AssetRepo.get(investment.asset_id),
         {:ok, fx_attrs} <-
           ForeignCurrencyConversion.currency_attrs(
             asset,
             attrs[:amount_invested_cents],
             attrs[:transaction_date],
             opts
           ),
         {:ok, transaction} <- build_reinvestment(investment, attrs, fx_attrs),
         {:ok, created} <- InvestmentTransactionRepo.create(transaction) do
      {:ok, created}
    end
  end

  defp ensure_open(%Investment{status: :open}), do: :ok
  defp ensure_open(%Investment{}), do: {:error, :investment_closed}

  defp build_reinvestment(%Investment{} = investment, attrs, fx_attrs) do
    InvestmentTransaction.new(%{
      id: UUID.generate(),
      investment_id: investment.id,
      transaction_type: :reinvestment,
      input_currency: :BRL,
      amount_invested_cents: attrs[:amount_invested_cents],
      exchange_rate_used: fx_attrs.exchange_rate_used,
      amount_invested_usd_cents: fx_attrs.amount_invested_usd_cents,
      quantity: attrs[:quantity],
      unit_price_cents: attrs[:unit_price_cents],
      transaction_date: attrs[:transaction_date],
      fees_cents: attrs[:fees_cents] || 0,
      notes: attrs[:notes]
    })
  end

end
