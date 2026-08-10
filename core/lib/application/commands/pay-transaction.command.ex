defmodule SolarisCore.Application.Commands.PayTransaction do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(String.t(), String.t(), integer() | nil) :: {:ok, term()} | {:error, term()}
  def execute(budget_month_id, transaction_id, actual_amount \\ nil) do
    with {:ok, budget_month} <- BudgetMonthRepo.get(budget_month_id),
         {:ok, updated} <-
           BudgetMonth.pay_transaction(budget_month, transaction_id, actual_amount) do
      BudgetMonthRepo.update(updated)
    end
  end
end
