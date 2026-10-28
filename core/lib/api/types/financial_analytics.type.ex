defmodule SolarisCoreWeb.Api.Types.FinancialAnalyticsTypes do
  use Absinthe.Schema.Notation

  object :financial_analytics do
    field(:period, non_null(:analytics_period))
    field(:expenses_by_category, non_null(list_of(non_null(:category_expense_slice))))

    field(
      :monthly_income_expense_trend,
      non_null(list_of(non_null(:monthly_income_expense_point)))
    )

    field(
      :expenses_by_payment_method,
      non_null(list_of(non_null(:payment_method_expense_slice)))
    )

    field(:totals, non_null(:financial_analytics_totals))
  end

  object :analytics_period do
    field(:start_date, non_null(:date))
    field(:end_date, non_null(:date))
    field(:month_count, non_null(:integer))
  end

  object :category_expense_slice do
    field(:category_id, non_null(:id))
    field(:category_name, non_null(:string))
    field(:category_color, :string)
    field(:total_amount, non_null(:integer))
    field(:transaction_count, non_null(:integer))
    field(:percentage, non_null(:float))
  end

  object :monthly_income_expense_point do
    field(:year, non_null(:integer))
    field(:month, non_null(:integer))
    field(:label, non_null(:string))
    field(:income_total, non_null(:integer))
    field(:expense_total, non_null(:integer))
    field(:balance, non_null(:integer))
  end

  object :payment_method_expense_slice do
    field(:payment_method, non_null(:payment_method))
    field(:total_amount, non_null(:integer))
    field(:transaction_count, non_null(:integer))
    field(:percentage, non_null(:float))
  end

  object :financial_analytics_totals do
    field(:income_total, non_null(:integer))
    field(:expense_total, non_null(:integer))
    field(:balance, non_null(:integer))
    field(:transaction_count, non_null(:integer))
  end

  object :financial_analytics_page do
    field(:page, non_null(:integer))
    field(:page_size, non_null(:integer))
    field(:total_months, non_null(:integer))
    field(:total_pages, non_null(:integer))
    field(:has_next_page, non_null(:boolean))
    field(:has_previous_page, non_null(:boolean))
    field(:analytics, non_null(:financial_analytics))
  end
end
