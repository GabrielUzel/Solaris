defmodule SolarisCore.Application.Queries.GetBudgetMonthByReference do
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(integer(), integer()) :: {:ok, term()} | {:error, :not_found}
  def execute(year, month) do
    BudgetMonthRepo.get_by_reference(year, month)
  end
end
