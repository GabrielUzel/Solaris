defmodule SolarisCore.Infrastructure.Schemas.InvestmentTransactionSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "investment_transactions" do
    field(:transaction_type, Ecto.Enum,
      values: [:buy, :reinvestment, :partial_sell, :full_sell, :redemption]
    )

    field(:input_currency, Ecto.Enum, values: [:BRL], default: :BRL)
    field(:amount_invested_cents, :integer)
    field(:exchange_rate_used, :decimal)
    field(:amount_invested_usd_cents, :integer)
    field(:quantity, :decimal)
    field(:unit_price_cents, :integer)
    field(:transaction_date, :date)
    field(:fees_cents, :integer, default: 0)
    field(:notes, :string)

    belongs_to(:investment, SolarisCore.Infrastructure.Schemas.InvestmentSchema)

    timestamps()
  end

  def changeset(investment_transaction, attrs) do
    investment_transaction
    |> cast(attrs, [
      :investment_id,
      :transaction_type,
      :input_currency,
      :amount_invested_cents,
      :exchange_rate_used,
      :amount_invested_usd_cents,
      :quantity,
      :unit_price_cents,
      :transaction_date,
      :fees_cents,
      :notes
    ])
    |> validate_required([
      :investment_id,
      :transaction_type,
      :input_currency,
      :amount_invested_cents,
      :transaction_date
    ])
    |> validate_amount_invested_cents()
    |> validate_number(:exchange_rate_used, greater_than: 0)
    |> validate_number(:amount_invested_usd_cents, greater_than: 0)
    |> validate_number(:quantity, greater_than: 0)
    |> validate_number(:unit_price_cents, greater_than: 0)
    |> validate_number(:fees_cents, greater_than_or_equal_to: 0)
    |> foreign_key_constraint(:investment_id)
  end

  defp validate_amount_invested_cents(changeset) do
    if get_field(changeset, :transaction_type) in [:buy, :reinvestment] do
      validate_number(changeset, :amount_invested_cents, greater_than: 0)
    else
      changeset
    end
  end
end
