defmodule SolarisCore.Infrastructure.Schemas.CategorySchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "categories" do
    field :name, :string
    field :type, Ecto.Enum, values: [:income, :expense]
    field :color, :string

    has_many :transactions, SolarisCore.Infrastructure.Schemas.TransactionSchema,
      foreign_key: :category_id

    timestamps()
  end

  def changeset(category, attrs) do
    category
    |> cast(attrs, [:name, :type, :color])
    |> validate_required([:name, :type])
  end
end
