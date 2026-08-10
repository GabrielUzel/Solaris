defmodule SolarisCore.Application.Commands.EnsureBudgetMonthByReference do
  alias SolarisCore.Application.Commands.OpenBudgetMonth
  alias SolarisCore.Application.Commands.InitializeBudgetMonthFromPlannedTransactions

  @spec execute(integer(), integer()) :: {:ok, term()} | {:error, term()}
  def execute(year, month) do
    with {:ok, budget_month} <- OpenBudgetMonth.execute(year, month),
         {:ok, initialized} <-
           InitializeBudgetMonthFromPlannedTransactions.execute(budget_month.id) do
      {:ok, initialized}
    end
  end
end
