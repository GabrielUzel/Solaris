defmodule SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.InvestmentTransactionSchema
  alias SolarisCore.Finance.Domain.InvestmentTransaction
  import Ecto.Query

  def create(%InvestmentTransaction{} = domain_transaction) do
    %InvestmentTransactionSchema{}
    |> InvestmentTransactionSchema.changeset(to_schema_attrs(domain_transaction))
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def list_by_investment(investment_id) do
    InvestmentTransactionSchema
    |> where([t], t.investment_id == ^investment_id)
    |> order_by([t], asc: t.transaction_date, asc: t.inserted_at)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_by_investment_ids(investment_ids) do
    InvestmentTransactionSchema
    |> where([t], t.investment_id in ^investment_ids)
    |> order_by([t], asc: t.transaction_date, asc: t.inserted_at)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  defp to_schema_attrs(%InvestmentTransaction{} = domain) do
    %{
      investment_id: domain.investment_id,
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

  defp to_domain(%InvestmentTransactionSchema{} = schema) do
    {:ok, transaction} =
      InvestmentTransaction.new(%{
        id: schema.id,
        investment_id: schema.investment_id,
        transaction_type: schema.transaction_type,
        input_currency: schema.input_currency,
        amount_invested_cents: schema.amount_invested_cents,
        exchange_rate_used: schema.exchange_rate_used,
        amount_invested_usd_cents: schema.amount_invested_usd_cents,
        quantity: schema.quantity,
        unit_price_cents: schema.unit_price_cents,
        transaction_date: schema.transaction_date,
        fees_cents: schema.fees_cents,
        notes: schema.notes,
        created_at: schema.inserted_at,
        updated_at: schema.updated_at
      })

    transaction
  end
end
