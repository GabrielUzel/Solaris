defmodule SolarisCore.Application.Queries.ListCategories do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema

  @spec execute() :: {:ok, [map()]}
  def execute do
    categories =
      Repo.all(from(c in CategorySchema, order_by: [asc: c.name]))

    {:ok, categories}
  end
end
