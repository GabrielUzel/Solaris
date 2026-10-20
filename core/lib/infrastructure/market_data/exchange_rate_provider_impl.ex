defmodule SolarisCore.Infrastructure.MarketData.ExchangeRateProviderImpl do
  @behaviour SolarisCore.Finance.Domain.ExchangeRateProvider

  require Logger

  alias SolarisCore.Infrastructure.MarketData.BrapiClient
  alias SolarisCore.Infrastructure.MarketData.SnapshotCache
  alias SolarisCore.Infrastructure.Repositories.ExchangeRateSnapshotRepo

  @impl true
  def fetch_rate(pair, date) do
    SnapshotCache.get_or_fetch(
      fn -> cached_rate(pair, date) end,
      fn -> fetch_and_cache(pair, date) end
    )
  end

  defp cached_rate(pair, date) do
    case ExchangeRateSnapshotRepo.get_by_pair_and_date(pair, date) do
      {:ok, snapshot} -> {:ok, snapshot.rate}
      {:error, :not_found} -> {:error, :not_found}
    end
  end

  defp fetch_and_cache(pair, date) do
    with {:ok, rate} <- fetch_remote(pair, date) do
      persist_snapshot(pair, date, rate)
      {:ok, rate}
    end
  end

  defp fetch_remote(pair, date) do
    if Date.compare(date, Date.utc_today()) == :eq do
      BrapiClient.fetch_currency_rate(pair)
    else
      with {:ok, points} <- BrapiClient.fetch_currency_historical(pair, date, date) do
        case Enum.find(points, &(&1.date == date)) || List.last(points) do
          nil -> {:error, :no_data}
          %{rate: rate} -> {:ok, rate}
        end
      end
    end
  end

  defp persist_snapshot(pair, reference_date, rate) do
    %{
      pair: pair,
      reference_date: reference_date,
      rate: rate,
      source: "brapi",
      fetched_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    }
    |> ExchangeRateSnapshotRepo.upsert()
    |> case do
      {:ok, _snapshot} ->
        :ok

      {:error, changeset} ->
        Logger.warning(
          "Falha ao persistir snapshot de cambio #{pair}: #{inspect(changeset.errors)}"
        )

        :ok
    end
  end
end
