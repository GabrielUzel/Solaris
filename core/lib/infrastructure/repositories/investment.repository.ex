defmodule SolarisCore.Infrastructure.Repositories.InvestmentRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.InvestmentSchema
  alias SolarisCore.Infrastructure.Schemas.InvestmentTransactionSchema
  alias SolarisCore.Finance.Domain.Investment
  alias SolarisCore.Finance.Domain.InvestmentTransaction
  import Ecto.Query

  def create(%Investment{} = domain_investment) do
    %InvestmentSchema{}
    |> InvestmentSchema.changeset(to_schema_attrs(domain_investment))
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def create_with_first_transaction(%Investment{} = investment, %InvestmentTransaction{} = transaction) do
    Ecto.Multi.new()
    |> Ecto.Multi.insert(
      :investment,
      InvestmentSchema.changeset(%InvestmentSchema{}, to_schema_attrs(investment))
    )
    |> Ecto.Multi.run(:transaction, fn _repo, %{investment: investment_schema} ->
      %InvestmentTransactionSchema{}
      |> InvestmentTransactionSchema.changeset(
        to_transaction_attrs(transaction, investment_schema.id)
      )
      |> Repo.insert()
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{investment: schema}} -> {:ok, to_domain(schema)}
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end

  def register_sale(%InvestmentTransaction{} = sale_transaction, close_attrs \\ nil) do
    investment_id = sale_transaction.investment_id

    Ecto.Multi.new()
    |> Ecto.Multi.insert(
      :sale_transaction,
      InvestmentTransactionSchema.changeset(
        %InvestmentTransactionSchema{},
        to_transaction_attrs(sale_transaction, investment_id)
      )
    )
    |> maybe_close_investment(investment_id, close_attrs)
    |> Repo.transaction()
    |> case do
      {:ok, _changes} -> get(investment_id)
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end

  def get(id) do
    case Repo.get(InvestmentSchema, id) do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def list_open do
    InvestmentSchema
    |> where([i], i.status == :open)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list(filters \\ []) do
    InvestmentSchema
    |> apply_filters(filters)
    |> order_by([i], desc: i.opened_at)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  defp apply_filters(query, filters) do
    Enum.reduce(filters, query, fn
      {:status, status}, acc ->
        where(acc, [i], i.status == ^status)

      {:asset_type, asset_type}, acc ->
        acc
        |> join(:inner, [i], a in assoc(i, :asset))
        |> where([_i, a], a.asset_type == ^asset_type)

      _, acc ->
        acc
    end)
  end

  def update_status(id, attrs) do
    with {:ok, schema} <- ok_or_error(Repo.get(InvestmentSchema, id)) do
      schema
      |> InvestmentSchema.changeset(Map.take(attrs, [:status, :closed_at]))
      |> Repo.update()
      |> case do
        {:ok, updated_schema} -> {:ok, to_domain(updated_schema)}
        error -> error
      end
    end
  end

  defp maybe_close_investment(multi, _investment_id, nil), do: multi

  defp maybe_close_investment(multi, investment_id, close_attrs) do
    Ecto.Multi.run(multi, :close_investment, fn _repo, _changes ->
      update_status(investment_id, close_attrs)
    end)
  end

  defp to_schema_attrs(%Investment{} = domain) do
    %{
      asset_id: domain.asset_id,
      status: domain.status,
      opened_at: domain.opened_at,
      closed_at: domain.closed_at
    }
  end

  defp to_transaction_attrs(%InvestmentTransaction{} = domain, investment_id) do
    %{
      investment_id: investment_id,
      transaction_type: domain.transaction_type,
      input_currency: domain.input_currency || :BRL,
      amount_invested_cents: domain.amount_invested_cents,
      exchange_rate_used: domain.exchange_rate_used,
      amount_invested_usd_cents: domain.amount_invested_usd_cents,
      quantity: domain.quantity,
      unit_price_cents: domain.unit_price_cents,
      transaction_date: domain.transaction_date,
      fees_cents: domain.fees_cents || 0,
      notes: domain.notes
    }
  end

  defp to_domain(%InvestmentSchema{} = schema) do
    {:ok, investment} =
      Investment.new(%{
        id: schema.id,
        asset_id: schema.asset_id,
        status: schema.status,
        opened_at: schema.opened_at,
        closed_at: schema.closed_at,
        created_at: schema.inserted_at,
        updated_at: schema.updated_at
      })

    investment
  end

  defp ok_or_error(nil), do: {:error, :not_found}
  defp ok_or_error(value), do: {:ok, value}
end
