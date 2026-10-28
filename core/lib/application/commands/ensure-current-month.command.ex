defmodule SolarisCore.Application.Commands.EnsureCurrentBudgetMonth do
  alias SolarisCore.Application.Commands.InitializeBudgetMonthFromPlannedTransactions
  alias SolarisCore.Application.Commands.OpenBudgetMonth
  alias SolarisCore.Application.Commands.RefreshBudgetMonthStatus

  @spec execute() :: {:ok, term()} | {:error, term()}
  def execute do
    today = Date.utc_today()

    with {:ok, budget_month} <- OpenBudgetMonth.execute(today.year, today.month),
         {:ok, initialized} <-
           InitializeBudgetMonthFromPlannedTransactions.execute(budget_month.id) do
      RefreshBudgetMonthStatus.execute(initialized)
    end
  end
end
