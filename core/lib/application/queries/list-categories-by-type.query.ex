defmodule SolarisCore.Application.Queries.ListCategoriesByType do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema

  @spec execute(:income | :expense) :: {:ok, [map()]}
  def execute(type) do
    categories =
      Repo.all(
        from(c in CategorySchema,
          where: c.type == ^type,
          order_by: [asc: c.name]
        )
      )

    {:ok, categories}
  end
end
