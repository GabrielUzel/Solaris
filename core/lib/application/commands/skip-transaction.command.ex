defmodule SolarisCore.Application.Commands.SkipTransaction do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(String.t(), String.t()) :: {:ok, term()} | {:error, term()}
  def execute(budget_month_id, transaction_id) do
    with {:ok, budget_month} <- BudgetMonthRepo.get(budget_month_id),
         {:ok, updated} <- BudgetMonth.skip_transaction(budget_month, transaction_id) do
      BudgetMonthRepo.update(updated)
    end
  end
end
