defmodule SolarisCore.Infrastructure.Schemas.DividendIncomeSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "dividends_income" do
    field(:income_type, Ecto.Enum,
      values: [:dividend, :jcp, :fii_income, :fixed_income_interest]
    )

    field(:gross_amount_cents, :integer)
    field(:net_amount_cents, :integer)
    field(:payment_date, :date)

    belongs_to(:investment, SolarisCore.Infrastructure.Schemas.InvestmentSchema)

    belongs_to(
      :reinvested_transaction,
      SolarisCore.Infrastructure.Schemas.InvestmentTransactionSchema,
      foreign_key: :reinvested_transaction_id
    )
  end

  def changeset(dividend_income, attrs) do
    dividend_income
    |> cast(attrs, [
      :investment_id,
      :income_type,
      :gross_amount_cents,
      :net_amount_cents,
      :payment_date,
      :reinvested_transaction_id
    ])
    |> validate_required([
      :investment_id,
      :income_type,
      :gross_amount_cents,
      :net_amount_cents,
      :payment_date
    ])
    |> validate_number(:gross_amount_cents, greater_than: 0)
    |> validate_number(:net_amount_cents, greater_than_or_equal_to: 0)
    |> validate_net_not_greater_than_gross()
    |> foreign_key_constraint(:investment_id)
    |> foreign_key_constraint(:reinvested_transaction_id)
  end

  defp validate_net_not_greater_than_gross(changeset) do
    gross_amount = get_field(changeset, :gross_amount_cents)
    net_amount = get_field(changeset, :net_amount_cents)

    if is_integer(gross_amount) and is_integer(net_amount) and net_amount > gross_amount do
      add_error(changeset, :net_amount_cents, "cannot be greater than gross_amount_cents")
    else
      changeset
    end
  end
end
