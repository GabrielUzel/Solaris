defmodule SolarisCoreWeb.Api.Schema do
  use Absinthe.Schema

  import_types(Absinthe.Type.Custom)
  import_types(SolarisCoreWeb.Api.Types.CommonTypes)
  import_types(SolarisCoreWeb.Api.Types.CategoryTypes)
  import_types(SolarisCoreWeb.Api.Types.PlannedTransactionTypes)
  import_types(SolarisCoreWeb.Api.Types.BudgetMonthTypes)

  import_types(SolarisCoreWeb.Api.Queries.CategoryQueries)
  import_types(SolarisCoreWeb.Api.Queries.BudgetMonthQueries)
  import_types(SolarisCoreWeb.Api.Queries.PlannedTransactionQueries)

  import_types(SolarisCoreWeb.Api.Mutations.CategoryMutations)
  import_types(SolarisCoreWeb.Api.Mutations.PlannedTransactionMutations)
  import_types(SolarisCoreWeb.Api.Mutations.BudgetMonthMutations)

  query do
    @desc "Health check"
    field :health, :string do
      resolve(fn _, _, _ -> {:ok, "OK"} end)
    end

    import_fields(:category_queries)
    import_fields(:budget_month_queries)
    import_fields(:planned_transaction_queries)
  end

  mutation do
    import_fields(:category_mutations)
    import_fields(:planned_transaction_mutations)
    import_fields(:budget_month_mutations)
  end
end
