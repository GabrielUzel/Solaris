defmodule SolarisCore.Infrastructure.Schemas.AccountSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "accounts" do
    field :name, :string
    field :type, Ecto.Enum,
      values: [:checking, :savings, :cash, :credit_card, :investment]

    has_many :transactions, SolarisCore.Infrastructure.Schemas.TransactionSchema,
      foreign_key: :account_id

    timestamps()
  end

  def changeset(account, attrs) do
    account
    |> cast(attrs, [:name, :type])
    |> validate_required([:name, :type])
  end
end
