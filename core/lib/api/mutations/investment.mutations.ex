defmodule SolarisCoreWeb.Api.Mutations.InvestmentMutations do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.InvestmentResolver

  object :investment_mutations do
    field :create_investment, non_null(:investment) do
      arg(:input, non_null(:create_investment_input))
      resolve(&InvestmentResolver.create_investment/3)
    end

    field :add_reinvestment, non_null(:investment) do
      arg(:input, non_null(:add_reinvestment_input))
      resolve(&InvestmentResolver.add_reinvestment/3)
    end

    field :register_sale, non_null(:investment) do
      arg(:input, non_null(:register_sale_input))
      resolve(&InvestmentResolver.register_sale/3)
    end

    field :register_income, non_null(:dividend_income) do
      arg(:input, non_null(:register_income_input))
      resolve(&InvestmentResolver.register_income/3)
    end
  end
end
