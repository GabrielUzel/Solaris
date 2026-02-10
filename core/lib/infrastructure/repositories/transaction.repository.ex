defmodule SolarisCore.Infrastructure.Repositories.TransactionRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema
  alias SolarisCore.Finance.Domain.{Transaction, Recurrence}
  import Ecto.Query

  def create(%Transaction{} = domain_transaction) do
    attrs = to_schema_attrs(domain_transaction)

    %TransactionSchema{}
    |> TransactionSchema.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def get(id) do
    case Repo.get(TransactionSchema, id) do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def list_all do
    TransactionSchema
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_by_account(account_id) do
    import Ecto.Query

    TransactionSchema
    |> where([t], t.account_id == ^account_id)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_by_description(description) do
    TransactionSchema
    |> where([t], ilike(t.description, ^"%#{description}%"))
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_by_type(type) do
    TransactionSchema
    |> where([t], t.type == ^type)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_by_category(category_id) do
    TransactionSchema
    |> where([t], t.category_id == ^category_id)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_by_recurrence(frequency) do
    TransactionSchema
    |> where([t], t.recurrence_frequency == ^frequency)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def update(%Transaction{id: id} = domain_transaction) do
    with {:ok, schema} <- Repo.get(TransactionSchema, id) |> ok_or_error(),
         attrs <- to_schema_attrs(domain_transaction),
         changeset <- TransactionSchema.changeset(schema, attrs),
         {:ok, updated_schema} <- Repo.update(changeset) do
      {:ok, to_domain(updated_schema)}
    end
  end

  def delete(id) do
    with {:ok, schema} <- Repo.get(TransactionSchema, id) |> ok_or_error() do
      Repo.delete(schema)
    end
  end

  defp to_schema_attrs(%Transaction{} = domain) do
    %{
      amount: domain.amount,
      type: domain.type,
      date: domain.date,
      description: domain.description,
      account_id: domain.account_id,
      category_id: domain.category_id,
      recurrence_frequency: domain.recurrence.frequency,
      recurrence_interval: domain.recurrence.interval,
      recurrence_day_of_month: domain.recurrence.day_of_month,
      recurrence_end_date: domain.recurrence.end_date
    }
  end

  defp to_domain(%TransactionSchema{} = schema) do
    {:ok, recurrence} =
      Recurrence.new(%{
        frequency: schema.recurrence_frequency,
        interval: schema.recurrence_interval,
        day_of_month: schema.recurrence_day_of_month,
        end_date: schema.recurrence_end_date
      })

    {:ok, transaction} =
      Transaction.new(%{
        id: schema.id,
        account_id: schema.account_id,
        amount: schema.amount,
        type: schema.type,
        date: schema.date,
        description: schema.description,
        category_id: schema.category_id,
        recurrence: recurrence
      })

    transaction
  end

  defp ok_or_error(nil), do: {:error, :not_found}
  defp ok_or_error(value), do: {:ok, value}
end
