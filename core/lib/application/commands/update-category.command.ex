defmodule SolarisCore.Finance.Application.Commands.UpdateCategory do
  alias SolarisCore.Finance.Domain.Category
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @type params :: %{
          optional(:name) => String.t(),
          optional(:type) => :income | :expense,
          optional(:color) => String.t()
        }

  @type result :: {:ok, Category.t()} | {:error, term()}

  @spec execute(String.t(), params()) :: result()
  def execute(id, params) do
    with {:ok, category} <- CategoryRepo.get(id),
         category_map <- Map.from_struct(category),
         {:ok, updated_category} <- Category.new(Map.merge(category_map, params)),
         {:ok, persisted} <- CategoryRepo.update(updated_category) do
      {:ok, persisted}
    end
  end
end
