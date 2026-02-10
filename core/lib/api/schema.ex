defmodule SolarisCoreWeb.Api.Schema do
  use Absinthe.Schema

  import_types(SolarisCoreWeb.Api.Types.CommonTypes)
  import_types(SolarisCoreWeb.Api.Types.AccountTypes)
  import_types(SolarisCoreWeb.Api.Types.CategoryTypes)
  import_types(SolarisCoreWeb.Api.Types.TransactionTypes)
  import_types(SolarisCoreWeb.Api.Mutations.AccountMutations)
  import_types(SolarisCoreWeb.Api.Mutations.CategoryMutations)
  import_types(SolarisCoreWeb.Api.Mutations.TransactionMutations)
  import_types(SolarisCoreWeb.Api.Queries.AccountQueries)
  import_types(SolarisCoreWeb.Api.Queries.CategoryQueries)
  import_types(SolarisCoreWeb.Api.Queries.TransactionQueries)

  query do
    @desc "Health check endpoint"
    field :health, :string do
      resolve(fn _, _, _ -> {:ok, "OK"} end)
    end

    import_fields(:account_queries)
    import_fields(:category_queries)
    import_fields(:transaction_queries)
  end

  mutation do
    import_fields(:account_mutations)
    import_fields(:category_mutations)
    import_fields(:transaction_mutations)
  end
end
