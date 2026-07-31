defmodule SolarisCore.Application.Queries.ListActivePlannedTransactions do
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute() :: [term()]
  def execute do
    PlannedTransactionRepo.list_active()
  end
end
