defmodule SolarisCoreWeb.Api.Queries.AccountQueries do
  use Absinthe.Schema.Notation
  alias SolarisCoreWeb.Api.Resolvers.AccountResolver

  object :account_queries do
    field :accounts, non_null(list_of(non_null(:account))) do
      resolve(&AccountResolver.get_all/3)
    end

    field :account_balance, :account_balance do
      arg(:id, non_null(:id))
      resolve(&AccountResolver.get_balance/3)
    end

    field :total_balance, non_null(:total_balance_result) do
      resolve(&AccountResolver.get_total_balance/3)
    end
  end
end
