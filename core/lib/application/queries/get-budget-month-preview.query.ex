defmodule SolarisCore.Application.Queries.GetBudgetMonthPreview do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Infrastructure.Schemas.PlannedTransactionSchema

  @spec execute(integer(), integer()) :: {:ok, map()}
  def execute(year, month) do
    month_date = Date.new!(year, month, 1)

    rows =
      from(pt in PlannedTransactionSchema,
        left_join: c in CategorySchema,
        on: c.id == pt.category_id,
        where: pt.active == true,
        where: pt.starts_on <= ^month_date,
        select: %{
          id: pt.id,
          description: pt.description,
          amount: pt.amount,
          type: pt.type,
          category_id: pt.category_id,
          category_name: c.name,
          category_color: c.color,
          category_type: c.type,
          payment_method: pt.payment_method,
          day_of_month: pt.day_of_month,
          starts_on: pt.starts_on,
          notes: pt.notes
        }
      )
      |> Repo.all()

    transactions = Enum.map(rows, &build_transaction(&1, year, month))

    income_expected =
      transactions
      |> Enum.filter(&(&1.type == :income))
      |> Enum.reduce(0, &(&1.expected_amount + &2))

    expense_expected =
      transactions
      |> Enum.filter(&(&1.type == :expense))
      |> Enum.reduce(0, &(&1.expected_amount + &2))

    {:ok,
     %{
       reference_year: year,
       reference_month: month,
       exists_as_budget_month: false,
       transactions: transactions,
       summary: %{
         reference_year: year,
         reference_month: month,
         income_expected: income_expected,
         income_paid: 0,
         expense_expected: expense_expected,
         expense_paid: 0,
         total_expected: income_expected - expense_expected,
         total_paid: 0,
         transaction_count: length(transactions),
         is_closed: false,
         pending_expense_count: Enum.count(transactions, &(&1.type == :expense))
       }
     }}
  end

  defp build_transaction(row, year, month) do
    day = min(row.day_of_month, Date.days_in_month(Date.new!(year, month, 1)))
    occurred_on = Date.new!(year, month, day)

    %{
      id: row.id,
      planned_transaction_id: row.id,
      description: row.description,
      expected_amount: row.amount,
      actual_amount: nil,
      type: row.type,
      category_id: row.category_id,
      category_name: row.category_name,
      category_color: row.category_color,
      category_type: row.category_type,
      payment_method: row.payment_method,
      occurred_on: occurred_on,
      origin: :planned,
      status: :expected,
      notes: row.notes
    }
  end
end
