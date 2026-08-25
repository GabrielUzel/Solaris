defmodule SolarisCoreWeb.Api.Types.IncomeHistoryPointTypes do
  use Absinthe.Schema.Notation

  object :income_history_point do
    field(:period, non_null(:string))
    field(:total_net_amount_cents, non_null(:integer))
  end
end
