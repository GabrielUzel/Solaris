defmodule SolarisCore.Application.Queries.GetBudgetMonthPreview do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo
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
        order_by: [asc: pt.day_of_month, asc: pt.description],
        select: %{
          id: pt.id,
          description: pt.description,
          amount: pt.amount,
          type: pt.type,
          payment_method: pt.payment_method,
          day_of_month: pt.day_of_month,
          category_name: c.name,
          category_color: c.color
        }
      )
      |> Repo.all()

    transactions = Enum.map(rows, &build_transaction(&1, year, month))

    income_expected =
      transactions
      |> Enum.filter(&(&1.type == :income))
      |> Enum.reduce(0, &(&1.amount + &2))

    expense_expected =
      transactions
      |> Enum.filter(&(&1.type == :expense))
      |> Enum.reduce(0, &(&1.amount + &2))

    {:ok,
     %{
       reference_year: year,
       reference_month: month,
       exists_as_budget_month: BudgetMonthRepo.exists_by_reference?(year, month),
       transactions: transactions,
       summary: %{
         income_expected: income_expected,
         expense_expected: expense_expected,
         projected_balance: income_expected - expense_expected,
         transaction_count: length(transactions)
       }
     }}
  end

  defp build_transaction(row, year, month) do
    day = min(row.day_of_month, Date.days_in_month(Date.new!(year, month, 1)))

    %{
      id: row.id,
      planned_transaction_id: row.id,
      description: row.description,
      amount: row.amount,
      type: row.type,
      payment_method: row.payment_method,
      day_of_month: row.day_of_month,
      occurred_on: Date.new!(year, month, day),
      category_name: row.category_name,
      category_color: row.category_color
    }
  end
end
