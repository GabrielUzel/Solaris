defmodule SolarisCoreWeb.Api.Resolvers.CategoryResolver do
  alias SolarisCore.Application.Commands.CreateCategory
  alias SolarisCore.Application.Commands.UpdateCategory
  alias SolarisCore.Application.Commands.DeleteCategory
  alias SolarisCore.Application.Queries.ListCategories
  alias SolarisCore.Application.Queries.ListCategoriesByType
  alias SolarisCore.Application.Queries.GetCategoryById

  def list_categories(_parent, _args, _resolution) do
    ListCategories.execute()
  end

  def list_categories_by_type(_parent, %{type: type}, _resolution) do
    ListCategoriesByType.execute(type)
  end

  def get_category_by_id(_parent, %{id: id}, _resolution) do
    GetCategoryById.execute(id)
  end

  def create_category(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> CreateCategory.execute()
  end

  def update_category(_parent, %{id: id, input: input}, _resolution) do
    UpdateCategory.execute(id, to_domain_attrs(input))
  end

  def delete_category(_parent, %{id: id}, _resolution) do
    case DeleteCategory.execute(id) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  defp to_domain_attrs(input) do
    input
    |> Map.new(fn {k, v} -> {k, v} end)
  end
end
