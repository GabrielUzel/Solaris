defmodule SolarisCoreWeb.Api.Queries.InvestmentQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.InvestmentResolver

  object :investment_queries do
    field :investment, :investment do
      arg(:id, non_null(:id))
      resolve(&InvestmentResolver.investment/3)
    end

    field :investments, non_null(list_of(non_null(:investment))) do
      arg(:status, :string)
      arg(:asset_type, :asset_type)
      resolve(&InvestmentResolver.investments/3)
    end
  end
end
