defmodule SolarisCore.Finance.Application.Queries.GetAllCategories do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema

  def execute do
    query =
      from(category in CategorySchema,
        select: %{
          id: category.id,
          name: category.name,
          type: category.type,
          color: category.color,
          inserted_at: category.inserted_at
        },
        order_by: [asc: category.name]
      )

    categories = Repo.all(query)
    {:ok, categories}
  end
end
