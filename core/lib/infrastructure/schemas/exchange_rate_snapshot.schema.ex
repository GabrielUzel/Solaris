defmodule SolarisCore.Infrastructure.Schemas.ExchangeRateSnapshotSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "exchange_rate_snapshots" do
    field(:pair, :string)
    field(:reference_date, :date)
    field(:rate, :decimal)
    field(:source, :string)
    field(:fetched_at, :naive_datetime)
  end

  def changeset(exchange_rate_snapshot, attrs) do
    exchange_rate_snapshot
    |> cast(attrs, [:pair, :reference_date, :rate, :source, :fetched_at])
    |> validate_required([:pair, :reference_date, :rate, :source, :fetched_at])
    |> validate_number(:rate, greater_than: 0)
    |> unique_constraint([:pair, :reference_date])
  end
end
