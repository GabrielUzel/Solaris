defmodule SolarisCore.Application.Commands.RefreshBudgetMonthStatus do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(BudgetMonth.t()) :: {:ok, BudgetMonth.t()} | {:error, term()}
  def execute(%BudgetMonth{status: :ongoing} = budget_month) do
    today = Date.utc_today()

    if Date.compare(today, budget_month.ends_on) == :gt do
      result =
        if BudgetMonth.pending_expenses(budget_month) == [] do
          BudgetMonth.close_if_all_expenses_paid_on_month_end(budget_month, today)
        else
          BudgetMonth.mark_pending_if_expired(budget_month, today)
        end

      with {:ok, updated} <- result do
        if updated.status != budget_month.status do
          BudgetMonthRepo.update_status(updated.id, updated.status)
        else
          {:ok, updated}
        end
      end
    else
      {:ok, budget_month}
    end
  end

  def execute(%BudgetMonth{} = budget_month), do: {:ok, budget_month}
end
