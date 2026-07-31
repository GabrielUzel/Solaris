defmodule SolarisCore.Application.Queries.GetCurrentBudgetMonth do
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute() :: {:ok, term()} | {:error, :not_found}
  def execute do
    today = Date.utc_today()
    BudgetMonthRepo.get_by_reference(today.year, today.month)
  end
end
