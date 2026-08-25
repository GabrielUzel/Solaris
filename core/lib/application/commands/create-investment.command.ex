defmodule SolarisCore.Application.Commands.CreateInvestment do
  alias Ecto.UUID
  alias SolarisCore.Application.Commands.Support.ForeignCurrencyConversion
  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Finance.Domain.Investment
  alias SolarisCore.Finance.Domain.InvestmentTransaction
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo

  @spec execute(map(), keyword()) :: {:ok, Investment.t()} | {:error, term()}
  def execute(attrs, opts \\ []) do
    with {:ok, asset} <- AssetRepo.get(attrs[:asset_id]),
         {:ok, fx_attrs} <-
           ForeignCurrencyConversion.currency_attrs(
             asset,
             attrs[:amount_invested_cents],
             attrs[:transaction_date],
             opts
           ),
         {:ok, investment} <- build_investment(asset, attrs),
         {:ok, transaction} <- build_first_transaction(investment, asset, attrs, fx_attrs),
         {:ok, created} <- InvestmentRepo.create_with_first_transaction(investment, transaction) do
      {:ok, created}
    end
  end

  defp build_investment(%Asset{} = asset, attrs) do
    Investment.new(%{
      id: UUID.generate(),
      asset_id: asset.id,
      status: :open,
      opened_at: attrs[:transaction_date]
    })
  end

  defp build_first_transaction(%Investment{} = investment, %Asset{} = _asset, attrs, fx_attrs) do
    InvestmentTransaction.new(%{
      id: UUID.generate(),
      investment_id: investment.id,
      transaction_type: :buy,
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
