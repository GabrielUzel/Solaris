defmodule SolarisCore.Finance.Application.Commands.DeleteTransaction do
  alias SolarisCore.Infrastructure.Repositories.TransactionRepo

  @type result :: {:ok, term()} | {:error, term()}

  @spec execute(String.t()) :: result()
  def execute(id) do
    TransactionRepo.delete(id)
  end
end
