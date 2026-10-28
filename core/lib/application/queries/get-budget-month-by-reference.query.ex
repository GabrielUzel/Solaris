defmodule SolarisCore.Application.Queries.GetBudgetMonthByReference do
  alias SolarisCore.Application.Commands.RefreshBudgetMonthStatus
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(integer(), integer()) :: {:ok, map()} | {:error, :not_found}
  def execute(year, month) do
    with {:ok, budget_month} <- BudgetMonthRepo.get_by_reference(year, month) do
      RefreshBudgetMonthStatus.execute(budget_month)
    end
  end
end
