defmodule SolarisCore.Application.Queries.ListClosedBudgetMonthsByYear do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.BudgetMonthSchema
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema

  @spec execute(integer()) :: {:ok, [map()]}
  def execute(year) do
    months =
      Repo.all(
        from(bm in BudgetMonthSchema,
          where: bm.status == :closed and bm.reference_year == ^year,
          order_by: bm.reference_month
        )
      )

    ids = Enum.map(months, & &1.id)

    transactions =
      Repo.all(
        from(t in TransactionSchema,
          left_join: c in CategorySchema,
          on: c.id == t.category_id,
          where: t.budget_month_id in ^ids and t.status != :skipped,
          order_by: [asc: t.occurred_on, asc: t.description],
          select: %{
            id: t.id,
            budget_month_id: t.budget_month_id,
            planned_transaction_id: t.planned_transaction_id,
            description: t.description,
            expected_amount: t.expected_amount,
            actual_amount: t.actual_amount,
            type: t.type,
            category_id: t.category_id,
            category_name: c.name,
            category_color: c.color,
            category_type: c.type,
            payment_method: t.payment_method,
            occurred_on: t.occurred_on,
            origin: t.origin,
            status: t.status,
            notes: t.notes
          }
        )
      )

    grouped_transactions = Enum.group_by(transactions, & &1.budget_month_id)

    report =
      Enum.map(months, fn budget_month ->
        month_transactions = Map.get(grouped_transactions, budget_month.id, [])

        income_total =
          month_transactions
          |> Enum.filter(&(&1.type == :income and &1.status == :paid))
          |> Enum.reduce(0, fn tx, acc -> (tx.actual_amount || 0) + acc end)

        expense_total =
          month_transactions
          |> Enum.filter(&(&1.type == :expense and &1.status == :paid))
          |> Enum.reduce(0, fn tx, acc -> (tx.actual_amount || 0) + acc end)

        %{
          id: budget_month.id,
          reference_year: budget_month.reference_year,
          reference_month: budget_month.reference_month,
          income_total: income_total,
          expense_total: expense_total,
          balance: income_total - expense_total,
          transaction_count: length(month_transactions),
          transactions: month_transactions
        }
      end)

    {:ok, report}
  end
end
