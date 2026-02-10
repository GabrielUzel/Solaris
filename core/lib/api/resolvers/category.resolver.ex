defmodule SolarisCoreWeb.Api.Resolvers.CategoryResolver do
  alias SolarisCore.Finance.Application.{Commands, Queries}

  # ============================================================================
  # MUTATIONS
  # ============================================================================

  def create(_parent, %{input: input}, _resolution) do
    Commands.CreateCategory.execute(input)
  end

  def update(_parent, %{id: id, input: input}, _resolution) do
    Commands.UpdateCategory.execute(id, input)
  end

  def delete(_parent, %{id: id}, _resolution) do
    case Commands.DeleteCategory.execute(id) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  # ============================================================================
  # QUERIES
  # ============================================================================

  def get_all(_parent, _args, _resolution) do
    Queries.GetAllCategories.execute()
  end

  def get_by_name(_parent, %{name: name}, _resolution) do
    Queries.GetCategoryByName.execute(name)
  end
end
