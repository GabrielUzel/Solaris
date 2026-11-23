defmodule SolarisCore.Infrastructure.Schemas.CreditCardSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}
  @foreign_key_type :binary_id

  schema "credit_cards" do
    field(:name, :string)
    field(:bank, :string)
    field(:closing_day, :integer)
    field(:due_day, :integer)
    field(:active, :boolean, default: true)

    timestamps()
  end

  def changeset(credit_card, attrs) do
    credit_card
    |> cast(attrs, [:id, :name, :bank, :closing_day, :due_day, :active])
    |> validate_required([:id, :name, :bank, :closing_day, :due_day])
    |> validate_number(:closing_day, greater_than_or_equal_to: 1, less_than_or_equal_to: 28)
    |> validate_number(:due_day, greater_than_or_equal_to: 1, less_than_or_equal_to: 28)
  end
end
