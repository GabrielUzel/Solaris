defmodule SolarisCore.Infrastructure.Schemas.PlannedTransactionSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "planned_transactions" do
    field(:description, :string)
    field(:amount, :integer)
    field(:type, Ecto.Enum, values: [:income, :expense])

    field(:payment_method, Ecto.Enum,
      values: [:pix, :bank_transfer, :boleto, :credit_card, :debit_card]
    )

    field(:day_of_month, :integer)
    field(:starts_on, :date)
    field(:active, :boolean, default: true)
    field(:notes, :string)

    belongs_to(:category, SolarisCore.Infrastructure.Schemas.CategorySchema)

    timestamps()
  end

  def changeset(planned_transaction, attrs) do
    planned_transaction
    |> cast(attrs, [
      :description,
      :amount,
      :type,
      :category_id,
      :payment_method,
      :day_of_month,
      :starts_on,
      :active,
      :notes
    ])
    |> validate_required([
      :description,
      :amount,
      :type,
      :category_id,
      :payment_method,
      :day_of_month,
      :starts_on,
      :active
    ])
    |> validate_number(:amount, greater_than: 0)
    |> validate_inclusion(:day_of_month, 1..31)
    |> foreign_key_constraint(:category_id)
  end
end
