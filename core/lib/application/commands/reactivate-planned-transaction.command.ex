defmodule SolarisCore.Application.Commands.ReactivatePlannedTransaction do
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute(String.t()) :: {:ok, term()} | {:error, term()}
  def execute(id) do
    with {:ok, planned} <- PlannedTransactionRepo.get(id),
         reactivated <- %{planned | active: true} do
      PlannedTransactionRepo.update(reactivated)
    end
  end
end
