defmodule SolarisCore.Application.Commands.DeletePlannedTransaction do
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute(String.t()) :: {:ok, term()} | {:error, term()}
  def execute(id) do
    with {:ok, _planned} <- PlannedTransactionRepo.get(id) do
      PlannedTransactionRepo.delete(id)
    end
  end
end
