defmodule SolarisCore.Application.Commands.DeactivatePlannedTransaction do
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute(String.t()) :: {:ok, term()} | {:error, term()}
  def execute(id) do
    with {:ok, planned} <- PlannedTransactionRepo.get(id),
         deactivated <- %{planned | active: false} do
      PlannedTransactionRepo.update(deactivated)
    end
  end
end
