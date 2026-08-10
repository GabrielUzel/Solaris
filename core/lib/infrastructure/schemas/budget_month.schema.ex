defmodule SolarisCore.Infrastructure.Schemas.BudgetMonthSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}
  @foreign_key_type :binary_id

  schema "budget_months" do
    field(:reference_year, :integer)
    field(:reference_month, :integer)
    field(:starts_on, :date)
    field(:ends_on, :date)
    field(:initialized_at, :utc_datetime)

    has_many(:transactions, SolarisCore.Infrastructure.Schemas.TransactionSchema,
      foreign_key: :budget_month_id,
      on_delete: :delete_all
    )

    timestamps()
  end

  def changeset(budget_month, attrs) do
    budget_month
    |> cast(attrs, [:id, :reference_year, :reference_month, :starts_on, :ends_on, :initialized_at])
    |> validate_required([:id, :reference_year, :reference_month, :starts_on, :ends_on])
    |> validate_inclusion(:reference_month, 1..12)
    |> unique_constraint([:reference_year, :reference_month])
  end
end
