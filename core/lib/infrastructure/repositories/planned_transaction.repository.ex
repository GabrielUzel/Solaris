defmodule SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.PlannedTransactionSchema
  alias SolarisCore.Finance.Domain.PlannedTransaction
  import Ecto.Query

  def create(%PlannedTransaction{} = domain) do
    attrs = to_schema_attrs(domain)

    %PlannedTransactionSchema{id: domain.id}
    |> PlannedTransactionSchema.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def get(id) do
    case Repo.get(PlannedTransactionSchema, id) do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def list_all do
    PlannedTransactionSchema
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_active do
    PlannedTransactionSchema
    |> where([pt], pt.active == true)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def update(%PlannedTransaction{id: id} = domain) do
    with {:ok, schema} <- ok_or_error(Repo.get(PlannedTransactionSchema, id)),
         attrs <- to_schema_attrs(domain),
         changeset <- PlannedTransactionSchema.changeset(schema, attrs),
         {:ok, updated_schema} <- Repo.update(changeset) do
      {:ok, to_domain(updated_schema)}
    end
  end

  def delete(id) do
    with {:ok, schema} <- ok_or_error(Repo.get(PlannedTransactionSchema, id)) do
      Repo.delete(schema)
    end
  end

  defp to_schema_attrs(%PlannedTransaction{} = domain) do
    %{
      description: domain.description,
      amount: domain.amount,
      type: domain.type,
      category_id: domain.category_id,
      payment_method: domain.payment_method,
      day_of_month: domain.day_of_month,
      starts_on: domain.starts_on,
      active: domain.active,
      notes: domain.notes
    }
  end

  defp to_domain(%PlannedTransactionSchema{} = schema) do
    {:ok, planned} =
      PlannedTransaction.new(%{
        id: schema.id,
        description: schema.description,
        amount: schema.amount,
        type: schema.type,
        category_id: schema.category_id,
        payment_method: schema.payment_method,
        day_of_month: schema.day_of_month,
        starts_on: schema.starts_on,
        active: schema.active,
        notes: schema.notes,
        created_at: schema.inserted_at,
        updated_at: schema.updated_at
      })

    planned
  end

  defp ok_or_error(nil), do: {:error, :not_found}
  defp ok_or_error(value), do: {:ok, value}
end
