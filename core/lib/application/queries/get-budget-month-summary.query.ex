defmodule SolarisCore.Application.Queries.GetBudgetMonthSummary do
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(String.t()) :: {:ok, map()} | {:error, :not_found}
  def execute(budget_month_id) do
    with {:ok, budget_month} <- BudgetMonthRepo.get(budget_month_id) do
      {:ok, build_summary(budget_month)}
    end
  end

  defp build_summary(budget_month) do
    transactions = budget_month.transactions

    income_expected = sum_by(transactions, :income, :expected)
    income_confirmed = sum_by(transactions, :income, :confirmed)
    expense_expected = sum_by(transactions, :expense, :expected)
    expense_confirmed = sum_by(transactions, :expense, :confirmed)

    %{
      reference_year: budget_month.reference_year,
      reference_month: budget_month.reference_month,
      income_expected: income_expected,
      income_confirmed: income_confirmed,
      expense_expected: expense_expected,
      expense_confirmed: expense_confirmed,
      total_expected: income_expected - expense_expected,
      total_confirmed: income_confirmed - expense_confirmed,
      transaction_count: length(transactions)
    }
  end

  defp sum_by(transactions, type, status) do
    transactions
    |> Enum.filter(&(&1.type == type and &1.status == status))
    |> Enum.reduce(0, &(&1.amount + &2))
  end
end
