defmodule SolarisCoreWeb.Api.Schema do
  use Absinthe.Schema

  import_types(Absinthe.Type.Custom)
  import_types(SolarisCoreWeb.Api.Types.CommonTypes)
  import_types(SolarisCoreWeb.Api.Types.CategoryTypes)
  import_types(SolarisCoreWeb.Api.Types.PlannedTransactionTypes)
  import_types(SolarisCoreWeb.Api.Types.BudgetMonthTypes)
  import_types(SolarisCoreWeb.Api.Types.AssetTypes)
  import_types(SolarisCoreWeb.Api.Types.InvestmentTypes)
  import_types(SolarisCoreWeb.Api.Types.InvestmentTransactionTypes)
  import_types(SolarisCoreWeb.Api.Types.DividendIncomeTypes)
  import_types(SolarisCoreWeb.Api.Types.PortfolioSummaryTypes)
  import_types(SolarisCoreWeb.Api.Types.InvestmentHistoryPointTypes)
  import_types(SolarisCoreWeb.Api.Types.IncomeHistoryPointTypes)
  import_types(SolarisCoreWeb.Api.Types.BenchmarkComparisonTypes)

  import_types(SolarisCoreWeb.Api.Queries.CategoryQueries)
  import_types(SolarisCoreWeb.Api.Queries.BudgetMonthQueries)
  import_types(SolarisCoreWeb.Api.Queries.PlannedTransactionQueries)
  import_types(SolarisCoreWeb.Api.Queries.AssetQueries)
  import_types(SolarisCoreWeb.Api.Queries.InvestmentQueries)
  import_types(SolarisCoreWeb.Api.Queries.PortfolioQueries)

  import_types(SolarisCoreWeb.Api.Mutations.CategoryMutations)
  import_types(SolarisCoreWeb.Api.Mutations.PlannedTransactionMutations)
  import_types(SolarisCoreWeb.Api.Mutations.BudgetMonthMutations)
  import_types(SolarisCoreWeb.Api.Mutations.InvestmentMutations)

  def plugins do
    [Absinthe.Middleware.Dataloader | Absinthe.Plugin.defaults()]
  end

  query do
    @desc "Health check"
    field :health, :string do
      resolve(fn _, _, _ -> {:ok, "OK"} end)
    end

    import_fields(:category_queries)
    import_fields(:budget_month_queries)
    import_fields(:planned_transaction_queries)
    import_fields(:asset_queries)
    import_fields(:investment_queries)
    import_fields(:portfolio_queries)
  end

  mutation do
    import_fields(:category_mutations)
    import_fields(:planned_transaction_mutations)
    import_fields(:budget_month_mutations)
    import_fields(:investment_mutations)
  end
end
