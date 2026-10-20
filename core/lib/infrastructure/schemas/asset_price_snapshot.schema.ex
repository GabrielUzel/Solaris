defmodule SolarisCore.Infrastructure.Schemas.AssetPriceSnapshotSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "asset_price_snapshots" do
    field(:reference_date, :date)
    field(:close_price_cents, :integer)
    field(:source, :string)
    field(:fetched_at, :naive_datetime)

    belongs_to(:asset, SolarisCore.Infrastructure.Schemas.AssetSchema)
  end

  def changeset(asset_price_snapshot, attrs) do
    asset_price_snapshot
    |> cast(attrs, [:asset_id, :reference_date, :close_price_cents, :source, :fetched_at])
    |> validate_required([:asset_id, :reference_date, :close_price_cents, :source, :fetched_at])
    |> validate_number(:close_price_cents, greater_than: 0)
    |> foreign_key_constraint(:asset_id)
    |> unique_constraint([:asset_id, :reference_date])
  end
end
