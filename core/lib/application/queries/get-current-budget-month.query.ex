defmodule SolarisCore.Application.Queries.GetCurrentBudgetMonth do
  alias SolarisCore.Application.Queries.GetBudgetMonthByReference

  @spec execute() :: {:ok, map()} | {:error, :not_found}
  def execute do
    today = Date.utc_today()
    GetBudgetMonthByReference.execute(today.year, today.month)
  end
end
