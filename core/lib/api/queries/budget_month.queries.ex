defmodule SolarisCoreWeb.Api.Queries.BudgetMonthQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.BudgetMonthResolver

  object :budget_month_queries do
    field :get_current_budget_month, :budget_month do
      resolve(&BudgetMonthResolver.get_current_budget_month/3)
    end

    field :get_budget_month_by_reference, :budget_month do
      arg :year, non_null(:integer)
      arg :month, non_null(:integer)
      resolve(&BudgetMonthResolver.get_budget_month_by_reference/3)
    end

    field :list_budget_month_transactions, non_null(list_of(non_null(:budget_month_transaction))) do
      arg :budget_month_id, non_null(:id)
      resolve(&BudgetMonthResolver.list_budget_month_transactions/3)
    end

    field :get_budget_month_summary, :budget_month_summary do
      arg :budget_month_id, non_null(:id)
      resolve(&BudgetMonthResolver.get_budget_month_summary/3)
    end
  end
end
