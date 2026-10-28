defmodule SolarisCore.Application.Commands.CloseBudgetMonth do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(String.t()) :: {:ok, BudgetMonth.t()} | {:error, term()}
  def execute(budget_month_id) do
    with {:ok, budget_month} <- fetch_budget_month(budget_month_id),
         {:ok, updated} <- BudgetMonth.close(budget_month) do
      BudgetMonthRepo.update_status(updated.id, updated.status)
    end
  end

  defp fetch_budget_month(id) do
    case BudgetMonthRepo.get(id) do
      {:error, :not_found} -> {:error, :budget_month_not_found}
      result -> result
    end
  end
end
