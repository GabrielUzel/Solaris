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
    field(:category_id, :binary_id)

    timestamps()
  end

  def changeset(transaction, attrs) do
    transaction
    |> cast(attrs, [:amount, :type, :date, :description, :category_id])
    |> validate_required([:amount, :type, :date, :description, :category_id])
    |> validate_number(:amount, greater_than: 0)
  end
end
