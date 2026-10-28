defmodule SolarisCore.Application.Queries.ListYearsWithClosedBudgetMonths do
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute() :: [integer()]
  def execute, do: BudgetMonthRepo.list_closed_years()
end
