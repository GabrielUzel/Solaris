defmodule SolarisCore.Infrastructure.Repositories.DividendIncomeRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.DividendIncomeSchema
  alias SolarisCore.Finance.Domain.DividendIncome
  import Ecto.Query

  def create(%DividendIncome{} = domain_income) do
    %DividendIncomeSchema{}
    |> DividendIncomeSchema.changeset(to_schema_attrs(domain_income))
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def list_by_investment(investment_id) do
    DividendIncomeSchema
    |> where([d], d.investment_id == ^investment_id)
    |> order_by([d], asc: d.payment_date)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_by_investment_ids(investment_ids) do
    DividendIncomeSchema
    |> where([d], d.investment_id in ^investment_ids)
    |> order_by([d], asc: d.payment_date)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  defp to_schema_attrs(%DividendIncome{} = domain) do
    %{
      investment_id: domain.investment_id,
      income_type: domain.income_type,
      gross_amount_cents: domain.gross_amount_cents,
      net_amount_cents: domain.net_amount_cents,
      payment_date: domain.payment_date,
      reinvested_transaction_id: domain.reinvested_transaction_id
    }
  end

  defp to_domain(%DividendIncomeSchema{} = schema) do
    {:ok, income} =
      DividendIncome.new(%{
        id: schema.id,
        investment_id: schema.investment_id,
        income_type: schema.income_type,
        gross_amount_cents: schema.gross_amount_cents,
        net_amount_cents: schema.net_amount_cents,
        payment_date: schema.payment_date,
        reinvested_transaction_id: schema.reinvested_transaction_id
      })

    income
  end
end
