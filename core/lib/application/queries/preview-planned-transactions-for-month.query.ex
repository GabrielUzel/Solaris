defmodule SolarisCore.Application.Queries.PreviewPlannedTransactionsForMonth do
  alias SolarisCore.Finance.Domain.PlannedTransaction
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute(integer(), integer()) :: [PlannedTransaction.t()]
  def execute(year, month) do
    month_date = Date.new!(year, month, 1)

    PlannedTransactionRepo.list_active()
    |> Enum.filter(&PlannedTransaction.applies_to_month?(&1, month_date))
  end
end
