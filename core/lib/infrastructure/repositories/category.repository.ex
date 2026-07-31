defmodule SolarisCore.Infrastructure.Repositories.CategoryRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Finance.Domain.Category
  import Ecto.Query

  def create(%Category{} = domain_category) do
    attrs = to_schema_attrs(domain_category)

    %CategorySchema{}
    |> CategorySchema.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def get(id) do
    case Repo.get(CategorySchema, id) do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def get_by_name(name) do
    CategorySchema
    |> where([c], c.name == ^name)
    |> Repo.one()
    |> case do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def list_all do
    CategorySchema
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_by_type(type) do
    CategorySchema
    |> where([c], c.type == ^type)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def update(%Category{id: id} = domain_category) do
    with {:ok, schema} <- ok_or_error(Repo.get(CategorySchema, id)),
         attrs <- to_schema_attrs(domain_category),
         changeset <- CategorySchema.changeset(schema, attrs),
         {:ok, updated_schema} <- Repo.update(changeset) do
      {:ok, to_domain(updated_schema)}
    end
  end

  def delete(id) do
    with {:ok, schema} <- ok_or_error(Repo.get(CategorySchema, id)) do
      Repo.delete(schema)
    end
  end

  defp to_schema_attrs(%Category{} = domain) do
    %{
      name: domain.name,
      type: domain.type,
      color: domain.color
    }
  end

  defp to_domain(%CategorySchema{} = schema) do
    {:ok, category} =
      Category.new(%{
        id: schema.id,
        name: schema.name,
        type: schema.type,
        color: schema.color,
        created_at: schema.inserted_at,
        updated_at: schema.updated_at
      })

    category
  end

  defp ok_or_error(nil), do: {:error, :not_found}
  defp ok_or_error(value), do: {:ok, value}
end
