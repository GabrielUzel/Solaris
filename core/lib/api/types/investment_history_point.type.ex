defmodule SolarisCoreWeb.Api.Types.InvestmentHistoryPointTypes do
  use Absinthe.Schema.Notation

  object :investment_history_point do
    field(:date, non_null(:date))
    field(:invested_amount_cents, non_null(:integer))
    field(:market_value_cents, non_null(:integer))
    field(:average_price_cents, non_null(:integer))
    field(:market_price_cents, :integer)
  end
end
