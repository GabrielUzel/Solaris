defmodule SolarisCore.Finance.Application.Commands.DeleteCategory do
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @type result :: {:ok, term()} | {:error, term()}

  @spec execute(String.t()) :: result()
  def execute(id) do
    CategoryRepo.delete(id)
  end
end
