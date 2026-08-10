defmodule SolarisCore.Application.Queries.GetCategoryById do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema

  @spec execute(String.t()) :: {:ok, map()} | {:error, :not_found}
  def execute(id) do
    case Repo.one(from(c in CategorySchema, where: c.id == ^id)) do
      nil -> {:error, :not_found}
      category -> {:ok, category}
    end
  end
end
