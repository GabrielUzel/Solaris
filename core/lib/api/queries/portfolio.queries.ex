defmodule SolarisCoreWeb.Api.Queries.PortfolioQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.PortfolioResolver

  object :portfolio_queries do
    field :portfolio_summary, non_null(:portfolio_summary) do
      resolve(&PortfolioResolver.portfolio_summary/3)
    end

    field :investment_value_history, non_null(list_of(non_null(:investment_history_point))) do
      arg(:investment_id, non_null(:id))
      arg(:from, :date)
      arg(:to, :date)
      resolve(&PortfolioResolver.investment_value_history/3)
    end

    field :income_history, non_null(list_of(non_null(:income_history_point))) do
      arg(:investment_id, :id)
      arg(:from, :date)
      arg(:to, :date)
      resolve(&PortfolioResolver.income_history/3)
    end

    field :benchmark_comparison, non_null(:benchmark_comparison) do
      arg(:investment_id, non_null(:id))
      arg(:benchmark, non_null(:benchmark_type))
      resolve(&PortfolioResolver.benchmark_comparison/3)
    end
  end
end
