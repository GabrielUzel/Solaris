defmodule SolarisCore.Finance.Application.Commands.DeleteAccount do
  alias SolarisCore.Infrastructure.Repositories.AccountRepo

  @type result :: {:ok, term()} | {:error, term()}

  @spec execute(String.t()) :: result()
  def execute(id) do
    AccountRepo.delete(id)
  end
end
