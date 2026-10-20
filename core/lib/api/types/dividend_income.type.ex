defmodule SolarisCoreWeb.Api.Types.DividendIncomeTypes do
  use Absinthe.Schema.Notation

  enum :income_type do
    value(:dividend)
    value(:jcp)
    value(:fii_income)
    value(:fixed_income_interest)
  end

  object :dividend_income do
    field(:id, non_null(:id))
    field(:income_type, non_null(:income_type))
    field(:gross_amount_cents, non_null(:integer))
    field(:net_amount_cents, non_null(:integer))
    field(:payment_date, non_null(:date))
  end

  input_object :register_income_input do
    field(:investment_id, non_null(:id))
    field(:income_type, non_null(:income_type))
    field(:gross_amount_cents, non_null(:integer))
    field(:net_amount_cents, non_null(:integer))
    field(:payment_date, non_null(:date))
    field(:reinvested_transaction_id, :id)
  end
end
