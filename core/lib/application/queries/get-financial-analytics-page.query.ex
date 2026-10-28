defmodule SolarisCore.Application.Queries.GetFinancialAnalyticsPage do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Application.Queries.GetFinancialAnalytics
  alias SolarisCore.Infrastructure.Schemas.BudgetMonthSchema

  @default_page_size 36

  @spec execute(integer(), integer()) :: {:ok, map()}
  def execute(page, page_size \\ @default_page_size) do
    page_size = min(page_size, @default_page_size)

    case first_budget_month_reference() do
      nil ->
        {:ok,
         %{
           page: page,
           page_size: page_size,
           total_months: 0,
           total_pages: 0,
           has_next_page: false,
           has_previous_page: false,
           analytics: empty_analytics()
         }}

      {first_year, first_month} ->
        {last_year, last_month} = last_reference_with_data()
        total_months = months_between({first_year, first_month}, {last_year, last_month}) + 1
        total_pages = ceil_div(total_months, page_size)

        page = max(1, min(page, total_pages))

        {start_year, start_month} = add_months({first_year, first_month}, (page - 1) * page_size)
        {end_year, end_month} = add_months({start_year, start_month}, page_size - 1)

        {end_year, end_month} =
          if months_after({end_year, end_month}, {last_year, last_month}) > 0,
            do: {last_year, last_month},
            else: {end_year, end_month}

        start_date = Date.new!(start_year, start_month, 1)
        end_date = Date.end_of_month(Date.new!(end_year, end_month, 1))

        {:ok, analytics} = GetFinancialAnalytics.execute(start_date, end_date)

        {:ok,
         %{
           page: page,
           page_size: page_size,
           total_months: total_months,
           total_pages: total_pages,
           has_next_page: page < total_pages,
           has_previous_page: page > 1,
           analytics: analytics
         }}
    end
  end

  defp first_budget_month_reference do
    from(bm in BudgetMonthSchema,
      order_by: [asc: bm.reference_year, asc: bm.reference_month],
      limit: 1,
      select: {bm.reference_year, bm.reference_month}
    )
    |> Repo.one()
  end

  defp last_reference_with_data do
    # Último budget_month com transações não-skipped, ou último budget_month existente
    from(bm in BudgetMonthSchema,
      order_by: [desc: bm.reference_year, desc: bm.reference_month],
      limit: 1,
      select: {bm.reference_year, bm.reference_month}
    )
    |> Repo.one()
  end

  defp months_between({year_1, month_1}, {year_2, month_2}) do
    (year_2 - year_1) * 12 + (month_2 - month_1)
  end

  defp add_months({year, month}, months) do
    total = year * 12 + (month - 1) + months
    {div(total, 12), rem(total, 12) + 1}
  end

  defp months_after({year_1, month_1}, {year_2, month_2}) do
    months_between({year_2, month_2}, {year_1, month_1})
  end

  defp ceil_div(dividend, divisor), do: div(dividend + divisor - 1, divisor)

  defp empty_analytics do
    today = Date.utc_today()

    %{
      period: %{start_date: today, end_date: today, month_count: 0},
      expenses_by_category: [],
      monthly_income_expense_trend: [],
      expenses_by_payment_method: [],
      totals: %{income_total: 0, expense_total: 0, balance: 0, transaction_count: 0}
    }
  end
end
