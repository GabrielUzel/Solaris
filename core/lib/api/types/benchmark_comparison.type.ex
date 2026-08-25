defmodule SolarisCoreWeb.Api.Types.BenchmarkComparisonTypes do
  use Absinthe.Schema.Notation

  enum :benchmark_type do
    value(:CDI)
    value(:IPCA)
    value(:IBOVESPA)
  end

  object :benchmark_comparison do
    field(:asset_return_percent, non_null(:float))
    field(:benchmark_return_percent, non_null(:float))
  end
end
