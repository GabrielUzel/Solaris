defmodule SolarisCore.Finance.Application.Queries.GetCategoryByName do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema

  def execute(name) do
    query =
      from(category in CategorySchema,
        where: category.name == ^name,
        select: %{
          id: category.id,
          name: category.name,
          type: category.type,
          color: category.color
        }
      )

    case Repo.one(query) do
      nil -> {:error, :not_found}
      category -> {:ok, category}
    end
  end
end
