defmodule SolarisCore.Application.Commands.DeleteCategory do
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(String.t()) :: {:ok, term()} | {:error, term()}
  def execute(id) do
    with {:ok, _category} <- CategoryRepo.get(id) do
      CategoryRepo.delete(id)
    end
  end
end
