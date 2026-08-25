defmodule SolarisCore.Infrastructure.MarketData.AssetPriceProviderImpl do
  @behaviour SolarisCore.Finance.Domain.AssetPriceProvider

  require Logger

  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Infrastructure.MarketData.BrapiClient
  alias SolarisCore.Infrastructure.MarketData.FinnhubClient
  alias SolarisCore.Infrastructure.MarketData.SnapshotCache
  alias SolarisCore.Infrastructure.Repositories.AssetPriceSnapshotRepo

  @impl true
  def fetch_price(%Asset{asset_type: :fixed_income} = asset, date) do
    fetch_indexer_value(asset, date)
  end

  def fetch_price(%Asset{} = asset, date) do
    SnapshotCache.get_or_fetch(
      fn -> cached_price(asset.id, date) end,
      fn -> fetch_and_cache(asset, date) end
    )
  end

  defp cached_price(asset_id, date) do
    case AssetPriceSnapshotRepo.get_by_asset_and_date(asset_id, date) do
      {:ok, snapshot} -> {:ok, snapshot.close_price_cents}
      {:error, :not_found} -> {:error, :not_found}
    end
  end

  defp fetch_and_cache(%Asset{market: :b3} = asset, date) do
    with {:ok, price_cents} <- fetch_b3_price(asset, date) do
      persist_snapshot(asset.id, date, price_cents, "brapi")
      {:ok, price_cents}
    end
  end

  defp fetch_and_cache(%Asset{market: :us_market} = asset, date) do
    if today?(date) do
      fetch_and_cache_us_quote(asset, date)
    else
      fetch_and_cache_us_historical(asset, date)
    end
  end

  defp fetch_b3_price(%Asset{} = asset, date) do
    symbol = external_symbol(asset)

    if today?(date) do
      BrapiClient.fetch_current_quote(symbol)
    else
      case fetch_b3_historical(symbol, asset.asset_type, date) do
        {:ok, points} -> pick_close_for_date(points, date)
        {:error, reason} -> {:error, reason}
      end
    end
  end

  defp fetch_b3_historical(symbol, :reit_fii, date) do
    BrapiClient.fetch_fii_historical(symbol, date, date)
  end

  defp fetch_b3_historical(symbol, _asset_type, date) do
    BrapiClient.fetch_stock_historical(symbol, date, date)
  end

  defp fetch_and_cache_us_quote(%Asset{} = asset, date) do
    with {:ok, quote} <- FinnhubClient.fetch_quote(external_symbol(asset)) do
      persist_snapshot(asset.id, date, quote.price_cents, "finnhub")
      {:ok, quote.price_cents}
    end
  end

  defp fetch_and_cache_us_historical(%Asset{} = asset, date) do
    symbol = external_symbol(asset)

    case FinnhubClient.fetch_candles(symbol, date, date) do
      {:ok, points} ->
        with {:ok, price_cents} <- pick_close_for_date(points, date) do
          persist_snapshot(asset.id, date, price_cents, "finnhub")
          {:ok, price_cents}
        end

      {:error, :historical_unavailable} ->
        Logger.info(
          "Historico da Finnhub indisponivel no plano atual para #{asset.ticker}; " <>
            "usando a cotacao mais recente como fallback."
        )

        with {:ok, quote} <- FinnhubClient.fetch_quote(symbol) do
          persist_snapshot(asset.id, quote.quoted_at, quote.price_cents, "finnhub")
          {:ok, quote.price_cents}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp fetch_indexer_value(%Asset{indexer: nil}, _date), do: {:error, :indexer_not_configured}

  defp fetch_indexer_value(%Asset{indexer: :PREFIXADO}, _date) do
    {:error, :no_public_price, indexer_value: nil}
  end

  defp fetch_indexer_value(%Asset{indexer: indexer}, date) do
    indicator = Atom.to_string(indexer)

    case fetch_indicator(indicator, date) do
      {:ok, value} -> {:error, :no_public_price, indexer_value: value}
      {:error, reason} -> {:error, reason}
    end
  end

  defp fetch_indicator(indicator, date) do
    if today?(date) do
      BrapiClient.fetch_latest_macro_indicator(indicator)
    else
      with {:ok, points} <- BrapiClient.fetch_macro_indicator(indicator, date, date) do
        case Enum.find(points, &(&1.date == date)) || List.last(points) do
          nil -> {:error, :no_data}
          %{value: value} -> {:ok, value}
        end
      end
    end
  end

  defp pick_close_for_date(points, date) do
    case Enum.find(points, &(&1.date == date)) || List.last(points) do
      nil -> {:error, :no_data}
      %{close_cents: close_cents} -> {:ok, close_cents}
    end
  end

  defp today?(date), do: Date.compare(date, Date.utc_today()) == :eq

  defp external_symbol(%Asset{external_symbol: nil, ticker: ticker}), do: ticker
  defp external_symbol(%Asset{external_symbol: external_symbol}), do: external_symbol

  defp persist_snapshot(asset_id, reference_date, close_price_cents, source) do
    %{
      asset_id: asset_id,
      reference_date: reference_date,
      close_price_cents: close_price_cents,
      source: source,
      fetched_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    }
    |> AssetPriceSnapshotRepo.upsert()
    |> case do
      {:ok, _snapshot} ->
        :ok

      {:error, changeset} ->
        Logger.warning(
          "Falha ao persistir snapshot de preco do ativo #{asset_id}: #{inspect(changeset.errors)}"
        )

        :ok
    end
  end
end
