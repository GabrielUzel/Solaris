defmodule SolarisCore.Infrastructure.Schemas.TransactionSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "transactions" do
    field(:amount, :integer)
    field(:type, Ecto.Enum, values: [:income, :expense])
    field(:date, :date)
    field(:description, :string)

    field(:recurrence_frequency, Ecto.Enum,
      values: [:once, :daily, :weekly, :monthly, :quarterly, :yearly],
      default: :once
    )

    field(:recurrence_interval, :integer, default: 1)
    field(:recurrence_day_of_month, :integer)
    field(:recurrence_end_date, :date)

    belongs_to(:account, SolarisCore.Infrastructure.Schemas.AccountSchema)
    belongs_to(:category, SolarisCore.Infrastructure.Schemas.CategorySchema)

    timestamps()
  end

  def changeset(transaction, attrs) do
    transaction
    |> cast(attrs, [
      :amount,
      :type,
      :date,
      :description,
      :account_id,
      :category_id,
      :recurrence_frequency,
      :recurrence_interval,
      :recurrence_day_of_month,
      :recurrence_end_date
    ])
    |> validate_required([:amount, :type, :date, :description, :account_id, :category_id])
    |> validate_number(:amount, greater_than: 0)
    |> foreign_key_constraint(:account_id)
    |> foreign_key_constraint(:category_id)
  end
end
