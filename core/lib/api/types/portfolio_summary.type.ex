defmodule SolarisCoreWeb.Api.Types.PortfolioSummaryTypes do
  use Absinthe.Schema.Notation

  object :portfolio_summary do
    field(:total_invested_cents, non_null(:integer))
    field(:total_market_value_cents, non_null(:integer))
    field(:total_profit_loss_cents, non_null(:integer))
    field(:allocation_by_type, non_null(list_of(non_null(:allocation_slice))))
    field(:ranking_by_return, non_null(list_of(non_null(:investment_return_rank))))
  end

  object :allocation_slice do
    field(:asset_type, non_null(:asset_type))
    field(:total_value_cents, non_null(:integer))
    field(:percentage, non_null(:float))
  end

  object :investment_return_rank do
    field(:investment_id, non_null(:id))
    field(:asset_ticker, non_null(:string))
    field(:twr_percent, :float)
    field(:xirr_percent, :float)
  end
end
