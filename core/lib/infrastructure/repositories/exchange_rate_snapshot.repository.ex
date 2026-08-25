defmodule SolarisCore.Infrastructure.Repositories.ExchangeRateSnapshotRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.ExchangeRateSnapshotSchema
  import Ecto.Query

  @spec get_by_pair_and_date(String.t(), Date.t()) ::
          {:ok, ExchangeRateSnapshotSchema.t()} | {:error, :not_found}
  def get_by_pair_and_date(pair, reference_date) do
    case Repo.get_by(ExchangeRateSnapshotSchema, pair: pair, reference_date: reference_date) do
      nil -> {:error, :not_found}
      snapshot -> {:ok, snapshot}
    end
  end

  @spec list_by_pair_and_date_range(String.t(), Date.t(), Date.t()) ::
          [ExchangeRateSnapshotSchema.t()]
  def list_by_pair_and_date_range(pair, from_date, to_date) do
    ExchangeRateSnapshotSchema
    |> where([s], s.pair == ^pair)
    |> where([s], s.reference_date >= ^from_date and s.reference_date <= ^to_date)
    |> order_by([s], asc: s.reference_date)
    |> Repo.all()
  end

  @spec upsert(map()) :: {:ok, ExchangeRateSnapshotSchema.t()} | {:error, Ecto.Changeset.t()}
  def upsert(attrs) do
    %ExchangeRateSnapshotSchema{}
    |> ExchangeRateSnapshotSchema.changeset(attrs)
    |> Repo.insert(
      on_conflict: [
        set: [
          rate: attrs[:rate],
          source: attrs[:source],
          fetched_at: attrs[:fetched_at]
        ]
      ],
      conflict_target: [:pair, :reference_date]
    )
  end
end
