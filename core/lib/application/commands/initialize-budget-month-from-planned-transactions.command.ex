defmodule SolarisCore.Application.Commands.InitializeBudgetMonthFromPlannedTransactions do
  alias SolarisCore.Finance.Domain.BudgetMonthInitializationService
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute(String.t()) :: {:ok, term()} | {:error, term()}
  def execute(budget_month_id) do
    with {:ok, budget_month} <- BudgetMonthRepo.get(budget_month_id),
         planned_transactions <- PlannedTransactionRepo.list_active(),
         {:ok, initialized} <- BudgetMonthInitializationService.initialize(budget_month, planned_transactions) do
      BudgetMonthRepo.update(initialized)
    end
  end
end
