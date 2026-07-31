defmodule SolarisCore.Application.Queries.GetCategoryById do
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(String.t()) :: {:ok, term()} | {:error, :not_found}
  def execute(id) do
    CategoryRepo.get(id)
  end
end
