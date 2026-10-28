defmodule SolarisCoreWeb.Api.Queries.BudgetMonthQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.BudgetMonthResolver

  object :budget_month_queries do
    field :get_current_budget_month, :budget_month do
      resolve(&BudgetMonthResolver.get_current_budget_month/3)
    end

    field :get_budget_month_by_reference, :budget_month do
      arg(:year, non_null(:integer))
      arg(:month, non_null(:integer))
      resolve(&BudgetMonthResolver.get_budget_month_by_reference/3)
    end

    field :list_budget_month_transactions,
          non_null(list_of(non_null(:budget_month_transaction))) do
      arg(:budget_month_id, non_null(:id))
      arg(:filters, :budget_month_transaction_filters)
      resolve(&BudgetMonthResolver.list_budget_month_transactions/3)
    end

    field :get_budget_month_summary, :budget_month_summary do
      arg(:budget_month_id, non_null(:id))
      resolve(&BudgetMonthResolver.get_budget_month_summary/3)
    end

    field :get_budget_month_preview, non_null(:budget_month_preview) do
      arg(:year, non_null(:integer))
      arg(:month, non_null(:integer))
      resolve(&BudgetMonthResolver.get_budget_month_preview/3)
    end

    field :get_next_unopened_budget_month_reference, :next_budget_month_reference do
      resolve(&BudgetMonthResolver.get_next_unopened_budget_month_reference/3)
    end

    field :get_financial_analytics, non_null(:financial_analytics) do
      arg(:start_date, non_null(:date))
      arg(:end_date, non_null(:date))
      arg(:category_limit, :integer)
      arg(:category_page, :integer)
      resolve(&BudgetMonthResolver.get_financial_analytics/3)
    end

    field :get_financial_analytics_page, non_null(:financial_analytics_page) do
      arg(:page, non_null(:integer))
      arg(:page_size, :integer)
      resolve(&BudgetMonthResolver.get_financial_analytics_page/3)
    end

    field :list_pending_budget_months, non_null(list_of(non_null(:budget_month))) do
      resolve(&BudgetMonthResolver.list_pending_budget_months/3)
    end

    field :list_closed_budget_months_by_year,
          non_null(list_of(non_null(:closed_budget_month_report))) do
      arg(:year, non_null(:integer))
      resolve(&BudgetMonthResolver.list_closed_budget_months_by_year/3)
    end

    field :list_years_with_closed_budget_months, non_null(list_of(non_null(:integer))) do
      resolve(&BudgetMonthResolver.list_years_with_closed_budget_months/3)
    end
  end
end
