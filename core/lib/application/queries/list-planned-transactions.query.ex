defmodule SolarisCore.Application.Queries.ListPlannedTransactions do
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute() :: [term()]
  def execute do
    PlannedTransactionRepo.list_all()
  end
end
