defmodule SolarisCore.Infrastructure.Schemas.InvestmentSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "investments" do
    field(:status, Ecto.Enum, values: [:open, :closed], default: :open)
    field(:opened_at, :date)
    field(:closed_at, :date)

    belongs_to(:asset, SolarisCore.Infrastructure.Schemas.AssetSchema)

    has_many(:transactions, SolarisCore.Infrastructure.Schemas.InvestmentTransactionSchema,
      foreign_key: :investment_id
    )

    has_many(:dividends_income, SolarisCore.Infrastructure.Schemas.DividendIncomeSchema,
      foreign_key: :investment_id
    )

    timestamps()
  end

  def changeset(investment, attrs) do
    investment
    |> cast(attrs, [:asset_id, :status, :opened_at, :closed_at])
    |> validate_required([:asset_id, :status, :opened_at])
    |> validate_closed_at()
    |> foreign_key_constraint(:asset_id)
  end

  defp validate_closed_at(changeset) do
    status = get_field(changeset, :status)
    opened_at = get_field(changeset, :opened_at)
    closed_at = get_field(changeset, :closed_at)

    changeset =
      case {status, closed_at} do
        {:open, %Date{}} ->
          add_error(changeset, :closed_at, "can only be set when status is closed")

        {:closed, nil} ->
          add_error(changeset, :closed_at, "is required when status is closed")

        _ ->
          changeset
      end

    if is_struct(opened_at, Date) and is_struct(closed_at, Date) and
         Date.compare(closed_at, opened_at) == :lt do
      add_error(changeset, :closed_at, "must be on or after opened_at")
    else
      changeset
    end
  end
end
