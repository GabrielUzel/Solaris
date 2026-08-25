defmodule SolarisCoreWeb.Api.Types.InvestmentTypes do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.InvestmentResolver

  object :investment do
    field(:id, non_null(:id))
    field(:asset, non_null(:asset), resolve: &InvestmentResolver.asset/3)
    field(:status, non_null(:string))
    field(:opened_at, non_null(:date))
    field(:closed_at, :date)

    field(:average_price_cents, non_null(:integer),
      resolve: &InvestmentResolver.average_price_cents/3
    )

    field(:current_quantity, non_null(:float), resolve: &InvestmentResolver.current_quantity/3)

    field(:total_invested_cents, non_null(:integer),
      resolve: &InvestmentResolver.total_invested_cents/3
    )

    field(:current_market_value_cents, :integer,
      resolve: &InvestmentResolver.current_market_value_cents/3
    )

    field(:profit_loss_cents, :integer, resolve: &InvestmentResolver.profit_loss_cents/3)
    field(:roi_percent, :float, resolve: &InvestmentResolver.roi_percent/3)
    field(:twr_percent, :float, resolve: &InvestmentResolver.twr_percent/3)
    field(:xirr_percent, :float, resolve: &InvestmentResolver.xirr_percent/3)

    field(:dividend_yield_accumulated, :float,
      resolve: &InvestmentResolver.dividend_yield_accumulated/3
    )

    field(:transactions, non_null(list_of(non_null(:investment_transaction))),
      resolve: &InvestmentResolver.transactions/3
    )
  end

  input_object :create_investment_input do
    field(:asset_id, non_null(:id))
    field(:amount_invested_cents, non_null(:integer))
    field(:quantity, :float)
    field(:transaction_date, non_null(:date))
  end

  input_object :add_reinvestment_input do
    field(:investment_id, non_null(:id))
    field(:amount_invested_cents, non_null(:integer))
    field(:quantity, :float)
    field(:transaction_date, non_null(:date))
  end

  input_object :register_sale_input do
    field(:investment_id, non_null(:id))
    field(:quantity, non_null(:float))
    field(:unit_price_cents, non_null(:integer))
    field(:transaction_date, non_null(:date))
    field(:sale_type, non_null(:sale_type))
  end
end
