defmodule SolarisCore.Application.Commands.UpdateCategory do
  alias SolarisCore.Finance.Domain.Category
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(String.t(), map()) :: {:ok, Category.t()} | {:error, term()}
  def execute(id, attrs) do
    with {:ok, existing} <- CategoryRepo.get(id),
         merged <- Map.merge(Map.from_struct(existing), attrs),
         {:ok, updated} <- Category.new(merged) do
      CategoryRepo.update(updated)
    end
  end
end
