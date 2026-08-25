defmodule SolarisCoreWeb.Api.Types.InvestmentTransactionTypes do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.InvestmentResolver

  enum :transaction_type do
    value(:buy)
    value(:reinvestment)
    value(:partial_sell)
    value(:full_sell)
    value(:redemption)
  end

  enum :sale_type do
    value(:partial_sell)
    value(:full_sell)
  end

  object :investment_transaction do
    field(:id, non_null(:id))
    field(:transaction_type, non_null(:transaction_type))
    field(:amount_invested_cents, non_null(:integer))

    field(:exchange_rate_used, :float, resolve: &InvestmentResolver.exchange_rate_used/3)

    field(:amount_invested_usd_cents, :integer)
    field(:quantity, :float, resolve: &InvestmentResolver.quantity/3)
    field(:unit_price_cents, :integer)
    field(:transaction_date, non_null(:date))
    field(:fees_cents, :integer)
    field(:notes, :string)
  end
end
