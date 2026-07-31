defmodule SolarisCore.Application.Queries.GetPlannedTransactionById do
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute(String.t()) :: {:ok, term()} | {:error, :not_found}
  def execute(id) do
    PlannedTransactionRepo.get(id)
  end
end
