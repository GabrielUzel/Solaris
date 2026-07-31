defmodule SolarisCore.Infrastructure.Repositories.BudgetMonthRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.BudgetMonthSchema
  alias SolarisCore.Infrastructure.Schemas.BudgetMonthTransactionSchema
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Finance.Domain.BudgetMonth.Transaction
  import Ecto.Query

  def create(%BudgetMonth{} = domain) do
    Ecto.Multi.new()
    |> Ecto.Multi.insert(:budget_month, BudgetMonthSchema.changeset(%BudgetMonthSchema{}, to_schema_attrs(domain)))
    |> insert_transactions(domain.id, domain.transactions)
    |> Repo.transaction()
    |> case do
      {:ok, %{budget_month: schema}} -> get(schema.id)
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end

  def get(id) do
    BudgetMonthSchema
    |> where([bm], bm.id == ^id)
    |> preload(:transactions)
    |> Repo.one()
    |> case do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def get_by_reference(year, month) do
    BudgetMonthSchema
    |> where([bm], bm.reference_year == ^year and bm.reference_month == ^month)
    |> preload(:transactions)
    |> Repo.one()
    |> case do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def update(%BudgetMonth{id: id} = domain) do
    with {:ok, schema} <- ok_or_error(Repo.get(BudgetMonthSchema, id)) do
      Ecto.Multi.new()
      |> Ecto.Multi.update(:budget_month, BudgetMonthSchema.changeset(schema, to_schema_attrs(domain)))
      |> sync_transactions(domain.id, domain.transactions)
      |> Repo.transaction()
      |> case do
        {:ok, _} -> get(id)
        {:error, _step, changeset, _changes} -> {:error, changeset}
      end
    end
  end

  defp insert_transactions(multi, _budget_month_id, []), do: multi

  defp insert_transactions(multi, budget_month_id, transactions) do
    Enum.reduce(transactions, multi, fn tx, acc ->
      Ecto.Multi.insert(
        acc,
        {:transaction, tx.id},
        BudgetMonthTransactionSchema.changeset(%BudgetMonthTransactionSchema{}, to_transaction_attrs(tx, budget_month_id))
      )
    end)
  end

  defp sync_transactions(multi, budget_month_id, transactions) do
    existing_ids = Enum.map(transactions, & &1.id)

    multi
    |> Ecto.Multi.delete_all(
      :delete_removed_transactions,
      from(t in BudgetMonthTransactionSchema,
        where: t.budget_month_id == ^budget_month_id and t.id not in ^existing_ids)
    )
    |> upsert_transactions(budget_month_id, transactions)
  end

  defp upsert_transactions(multi, _budget_month_id, []), do: multi

  defp upsert_transactions(multi, budget_month_id, transactions) do
    Enum.reduce(transactions, multi, fn tx, acc ->
      Ecto.Multi.insert(
        acc,
        {:upsert_transaction, tx.id},
        BudgetMonthTransactionSchema.changeset(%BudgetMonthTransactionSchema{}, to_transaction_attrs(tx, budget_month_id)),
        on_conflict: {:replace, [:description, :amount, :type, :category_id, :payment_method, :occurred_on, :origin, :status, :notes, :updated_at]},
        conflict_target: :id
      )
    end)
  end

  defp to_schema_attrs(%BudgetMonth{} = domain) do
    %{
      id: domain.id,
      reference_year: domain.reference_year,
      reference_month: domain.reference_month,
      starts_on: domain.starts_on,
      ends_on: domain.ends_on,
      initialized_at: domain.initialized_at
    }
  end

  defp to_transaction_attrs(%Transaction{} = tx, budget_month_id) do
    %{
      id: tx.id,
      budget_month_id: budget_month_id,
      planned_transaction_id: tx.planned_transaction_id,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category_id: tx.category_id,
      payment_method: tx.payment_method,
      occurred_on: tx.occurred_on,
      origin: tx.origin,
      status: tx.status,
      notes: tx.notes
    }
  end

  defp to_domain(%BudgetMonthSchema{} = schema) do
    transactions = Enum.map(schema.transactions, &to_transaction_domain/1)

    {:ok, budget_month} =
      BudgetMonth.new(%{
        id: schema.id,
        reference_year: schema.reference_year,
        reference_month: schema.reference_month,
        starts_on: schema.starts_on,
        ends_on: schema.ends_on,
        initialized_at: schema.initialized_at
      })

    %{budget_month | transactions: transactions}
  end

  defp to_transaction_domain(%BudgetMonthTransactionSchema{} = schema) do
    {:ok, transaction} =
      Transaction.new(%{
        id: schema.id,
        planned_transaction_id: schema.planned_transaction_id,
        description: schema.description,
        amount: schema.amount,
        type: schema.type,
        category_id: schema.category_id,
        payment_method: schema.payment_method,
        occurred_on: schema.occurred_on,
        origin: schema.origin,
        status: schema.status,
        notes: schema.notes,
        created_at: schema.inserted_at,
        updated_at: schema.updated_at
      })

    transaction
  end

  defp ok_or_error(nil), do: {:error, :not_found}
  defp ok_or_error(value), do: {:ok, value}
end
