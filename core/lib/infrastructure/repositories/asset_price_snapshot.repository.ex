defmodule SolarisCore.Infrastructure.Repositories.AssetPriceSnapshotRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.AssetPriceSnapshotSchema
  import Ecto.Query

  @spec get_by_asset_and_date(binary(), Date.t()) ::
          {:ok, AssetPriceSnapshotSchema.t()} | {:error, :not_found}
  def get_by_asset_and_date(asset_id, reference_date) do
    case Repo.get_by(AssetPriceSnapshotSchema, asset_id: asset_id, reference_date: reference_date) do
      nil -> {:error, :not_found}
      snapshot -> {:ok, snapshot}
    end
  end

  @spec list_by_asset_and_date_range(binary(), Date.t(), Date.t()) :: [AssetPriceSnapshotSchema.t()]
  def list_by_asset_and_date_range(asset_id, from_date, to_date) do
    AssetPriceSnapshotSchema
    |> where([s], s.asset_id == ^asset_id)
    |> where([s], s.reference_date >= ^from_date and s.reference_date <= ^to_date)
    |> order_by([s], asc: s.reference_date)
    |> Repo.all()
  end

  @spec list_by_asset_ids_and_date_range([binary()], Date.t(), Date.t()) ::
          [AssetPriceSnapshotSchema.t()]
  def list_by_asset_ids_and_date_range(asset_ids, from_date, to_date) do
    AssetPriceSnapshotSchema
    |> where([s], s.asset_id in ^asset_ids)
    |> where([s], s.reference_date >= ^from_date and s.reference_date <= ^to_date)
    |> order_by([s], asc: s.reference_date)
    |> Repo.all()
  end

  @spec upsert(map()) :: {:ok, AssetPriceSnapshotSchema.t()} | {:error, Ecto.Changeset.t()}
  def upsert(attrs) do
    %AssetPriceSnapshotSchema{}
    |> AssetPriceSnapshotSchema.changeset(attrs)
    |> Repo.insert(
      on_conflict: [
        set: [
          close_price_cents: attrs[:close_price_cents],
          source: attrs[:source],
          fetched_at: attrs[:fetched_at]
        ]
      ],
      conflict_target: [:asset_id, :reference_date]
    )
  end
end
