defmodule SolarisCore.Application.Queries.ListBudgetMonthTransactions do
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(String.t()) :: {:ok, [term()]} | {:error, :not_found}
  def execute(budget_month_id) do
    with {:ok, budget_month} <- BudgetMonthRepo.get(budget_month_id) do
      {:ok, budget_month.transactions}
    end
  end
end
