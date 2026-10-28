defmodule SolarisCore.Application.Queries.ListPendingBudgetMonths do
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute() :: [SolarisCore.Finance.Domain.BudgetMonth.t()]
  def execute do
    BudgetMonthRepo.list_by_status(:pending)
  end
end
