defmodule SolarisCore.Application.Queries.GetCurrentBudgetMonth do
  alias SolarisCore.Application.Commands.RefreshBudgetMonthStatus
  alias SolarisCore.Application.Queries.GetBudgetMonthByReference

  @spec execute() :: {:ok, map()} | {:error, :not_found}
  def execute do
    today = Date.utc_today()

    with {:ok, budget_month} <- GetBudgetMonthByReference.execute(today.year, today.month) do
      RefreshBudgetMonthStatus.execute(budget_month)
    end
  end
end
