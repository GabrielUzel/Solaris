defmodule SolarisCore.Application.Queries.GetBudgetMonthSummary do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.BudgetMonthSchema
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema

  @spec execute(String.t()) :: {:ok, map()} | {:error, :not_found}
  def execute(budget_month_id) do
    budget_month_query =
      from(bm in BudgetMonthSchema,
        where: bm.id == ^budget_month_id
      )

    case Repo.one(budget_month_query) do
      nil ->
        {:error, :not_found}

      budget_month ->
        transactions =
          Repo.all(
            from(t in TransactionSchema,
              where: t.budget_month_id == ^budget_month_id
            )
          )

        income_expected = sum_expected_by(transactions, :income)
        income_paid = sum_paid_by(transactions, :income)
        expense_expected = sum_expected_by(transactions, :expense)
        expense_paid = sum_paid_by(transactions, :expense)

        pending_expense_count = count_pending_expenses(transactions)

        {:ok,
         %{
           reference_year: budget_month.reference_year,
           reference_month: budget_month.reference_month,
           income_expected: income_expected,
           income_paid: income_paid,
           expense_expected: expense_expected,
           expense_paid: expense_paid,
           total_expected: income_expected - expense_expected,
           total_paid: income_paid - expense_paid,
           transaction_count: length(transactions),
           is_closed: pending_expense_count == 0,
           pending_expense_count: pending_expense_count
         }}
    end
  end

  defp sum_expected_by(transactions, type) do
    transactions
    |> Enum.filter(&(&1.type == type))
    |> Enum.reduce(0, &(&1.expected_amount + &2))
  end

  defp sum_paid_by(transactions, type) do
    transactions
    |> Enum.filter(&(&1.type == type and &1.status == :paid))
    |> Enum.reduce(0, fn tx, acc -> (tx.actual_amount || 0) + acc end)
  end

  defp count_pending_expenses(transactions) do
    Enum.count(transactions, fn
      %{type: :expense, status: :paid} -> false
      %{type: :expense} -> true
      _ -> false
    end)
  end
end
