defmodule SolarisCore.Infrastructure.Repositories.AccountRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.AccountSchema
  alias SolarisCore.Finance.Domain.Account

  def create(%Account{} = domain_account) do
    attrs = to_schema_attrs(domain_account)

    %AccountSchema{}
    |> AccountSchema.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def get(id) do
    case Repo.get(AccountSchema, id) do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def list_all do
    AccountSchema
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def update(%Account{id: id} = domain_account) do
    with {:ok, schema} <- Repo.get(AccountSchema, id) |> ok_or_error(),
         attrs <- to_schema_attrs(domain_account),
         changeset <- AccountSchema.changeset(schema, attrs),
         {:ok, updated_schema} <- Repo.update(changeset) do
      {:ok, to_domain(updated_schema)}
    end
  end

  def delete(id) do
    with {:ok, schema} <- Repo.get(AccountSchema, id) |> ok_or_error() do
      Repo.delete(schema)
    end
  end

  defp to_schema_attrs(%Account{} = domain) do
    %{
      name: domain.name,
      type: domain.type
    }
  end

  defp to_domain(%AccountSchema{} = schema) do
    {:ok, account} = Account.new(%{
      id: schema.id,
      name: schema.name,
      type: schema.type,
      inserted_at: schema.inserted_at,
      updated_at: schema.updated_at
    })

    account
  end

  defp ok_or_error(nil), do: {:error, :not_found}
  defp ok_or_error(value), do: {:ok, value}
end
