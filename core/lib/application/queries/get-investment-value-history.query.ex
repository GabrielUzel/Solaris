defmodule SolarisCore.Application.Queries.GetInvestmentValueHistory do
  @moduledoc """
  Serie temporal do valor de uma `investment` para o grafico de evolucao.

  Cada ponto corresponde a uma data com `asset_price_snapshot` em cache no
  intervalo pedido — nao dispara N chamadas a brapi/Finnhub por ponto do
  grafico. Usa o cache local (`asset_price_snapshots`), disparando uma
  sincronizacao apenas quando o intervalo pedido nao esta coberto por nenhum
  snapshot.

  Para cada data com preco disponivel:

  - `invested_amount_cents`: custo acumulado (total investido) das transacoes
    ate a data;
  - `market_value_cents`: valor de mercado da posicao na data (marcacao na
    curva para renda fixa, conversao cambial para ativos em USD);
  - `average_price_cents`: preco medio ponderado das entradas ate a data;
  - `market_price_cents`: preco de fechamento em cache na data (nil quando
    nao ha snapshot).

  Opcoes:

  - `:from` / `:to` — intervalo (default: `opened_at` ate hoje);
  - `:asset_price_provider` / `:exchange_rate_provider` — sobrescrevem a
    config (util em testes).
  """

  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Finance.Domain.InvestmentAnalysisRules
  alias SolarisCore.Finance.Domain.InvestmentRules
  alias SolarisCore.Infrastructure.MarketData.BrapiClient
  alias SolarisCore.Infrastructure.MarketData.FinnhubClient
  alias SolarisCore.Infrastructure.Repositories.AssetPriceSnapshotRepo
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.ExchangeRateSnapshotRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo

  @usd_brl_pair "USD-BRL"

  @spec execute(String.t(), keyword()) :: {:ok, [map()]} | {:error, :not_found}
  def execute(investment_id, opts \\ []) do
    with {:ok, investment} <- InvestmentRepo.get(investment_id),
         {:ok, asset} <- AssetRepo.get(investment.asset_id) do
      from = opts[:from] || investment.opened_at
      to = opts[:to] || Date.utc_today()

      transactions = InvestmentTransactionRepo.list_by_investment(investment.id)

      rate_lookup =
        ExchangeRateSnapshotRepo.list_by_pair_and_date_range(@usd_brl_pair, from, to)
        |> Map.new(&{&1.reference_date, &1.rate})

      points =
        if asset.asset_type == :fixed_income do
          # Renda fixa não tem cotação pública: gera pontos nas datas das
          # transações (e na data de referência) via marcação na curva.
          build_fixed_income_points(asset, investment, transactions, from, to)
        else
          snapshots =
            asset.id
            |> AssetPriceSnapshotRepo.list_by_asset_and_date_range(from, to)
            |> maybe_sync(asset, from, to, opts)

          build_points(asset, investment, transactions, snapshots, rate_lookup, opts)
        end

      {:ok, points}
    end
  end

  defp maybe_sync([], asset, from, to, opts) do
    case sync_range(asset, from, to, opts) do
      :ok -> AssetPriceSnapshotRepo.list_by_asset_and_date_range(asset.id, from, to)
      {:error, _reason} -> []
    end
  end

  defp maybe_sync(snapshots, _asset, _from, _to, _opts), do: snapshots

  defp sync_range(%Asset{asset_type: :fixed_income}, _from, _to, _opts), do: :ok

  defp sync_range(%Asset{market: :b3} = asset, from, to, _opts) do
    symbol = external_symbol(asset)

    result =
      case asset.asset_type do
        :reit_fii -> BrapiClient.fetch_fii_historical(symbol, from, to)
        _ -> BrapiClient.fetch_stock_historical(symbol, from, to)
      end

    persist_price_points(asset, result)
  end

  defp sync_range(%Asset{market: :us_market} = asset, from, to, _opts) do
    case FinnhubClient.fetch_candles(external_symbol(asset), from, to) do
      {:ok, points} ->
        Enum.each(points, fn %{date: date, close_cents: close_cents} ->
          persist_snapshot(asset.id, date, close_cents, "finnhub")
        end)

        :ok

      {:error, _reason} ->
        {:error, :sync_failed}
    end
  end

  defp persist_price_points(_asset, {:error, _reason}), do: {:error, :sync_failed}

  defp persist_price_points(asset, {:ok, points}) do
    Enum.each(points, fn %{date: date, close_cents: close_cents} ->
      persist_snapshot(asset.id, date, close_cents, "brapi")
    end)

    :ok
  end

  defp persist_snapshot(asset_id, reference_date, close_price_cents, source) do
    %{
      asset_id: asset_id,
      reference_date: reference_date,
      close_price_cents: close_price_cents,
      source: source,
      fetched_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    }
    |> AssetPriceSnapshotRepo.upsert()
  end

  defp build_points(asset, investment, transactions, snapshots, rate_lookup, opts) do
    Enum.flat_map(snapshots, fn snapshot ->
      date = snapshot.reference_date
      transactions_up_to = Enum.filter(transactions, &(Date.compare(&1.transaction_date, date) != :gt))

      invested_amount_cents = InvestmentRules.total_invested_cents(transactions_up_to)
      average_price_cents = InvestmentRules.average_price_cents(transactions_up_to)

      case market_value_at(asset, investment, transactions_up_to, date, snapshot, rate_lookup, opts) do
        nil ->
          []

        market_value_cents ->
          [
            %{
              date: date,
              invested_amount_cents: invested_amount_cents,
              market_value_cents: market_value_cents,
              average_price_cents: average_price_cents,
              market_price_cents: snapshot.close_price_cents
            }
          ]
      end
    end)
  end

  defp build_fixed_income_points(asset, investment, transactions, from, to) do
    dates =
      transactions
      |> Enum.map(& &1.transaction_date)
      |> Enum.filter(&(Date.compare(&1, from) != :lt and Date.compare(&1, to) != :gt))
      |> Enum.uniq()
      |> Kernel.++([to])
      |> Enum.uniq()
      |> Enum.sort(Date)

    with {:ok, indexer_series} <- fetch_indexer_series(asset, investment.opened_at, to) do
      Enum.map(dates, fn date ->
        transactions_up_to =
          Enum.filter(transactions, &(Date.compare(&1.transaction_date, date) != :gt))

        market_value_cents =
          InvestmentAnalysisRules.current_market_value_cents(asset, transactions_up_to, %{
            indexer_series: indexer_series,
            reference_date: date
          })

        %{
          date: date,
          invested_amount_cents: InvestmentRules.total_invested_cents(transactions_up_to),
          market_value_cents: market_value_cents,
          average_price_cents: InvestmentRules.average_price_cents(transactions_up_to),
          market_price_cents: nil
        }
      end)
    else
      {:error, _reason} -> []
    end
  end

  defp market_value_at(
         %Asset{asset_type: :fixed_income} = asset,
         investment,
         transactions,
         date,
         _snapshot,
         _rate_lookup,
         _opts
       ) do
    case fetch_indexer_series(asset, investment.opened_at, date) do
      {:ok, indexer_series} ->
        InvestmentAnalysisRules.current_market_value_cents(asset, transactions, %{
          indexer_series: indexer_series,
          reference_date: date
        })

      {:error, _reason} ->
        nil
    end
  end

  defp market_value_at(
         %Asset{market: :us_market} = asset,
         _investment,
         transactions,
         date,
         snapshot,
         rate_lookup,
         opts
       ) do
    case fetch_rate(date, rate_lookup, opts) do
      {:ok, rate} ->
        InvestmentAnalysisRules.current_market_value_cents(asset, transactions, %{
          unit_price_cents: snapshot.close_price_cents,
          exchange_rate: rate
        })

      {:error, _reason} ->
        nil
    end
  end

  defp market_value_at(
         %Asset{} = asset,
         _investment,
         transactions,
         _date,
         snapshot,
         _rate_lookup,
         _opts
       ) do
    InvestmentAnalysisRules.current_market_value_cents(asset, transactions, %{
      close_price_cents: snapshot.close_price_cents
    })
  end

  defp fetch_rate(date, rate_lookup, opts) do
    case Map.get(rate_lookup, date) do
      nil -> fetch_rate_from_provider(date, opts)
      rate -> {:ok, rate}
    end
  end

  defp fetch_rate_from_provider(date, opts) do
    case resolve_provider(opts, :exchange_rate_provider) do
      {:ok, provider} ->
        case provider.fetch_rate(@usd_brl_pair, date) do
          {:ok, rate} -> {:ok, rate}
          {:error, _reason} -> {:error, :price_unavailable}
        end

      {:error, :price_unavailable} ->
        {:error, :price_unavailable}
    end
  end

  defp fetch_indexer_series(%Asset{indexer: nil}, _from_date, _to_date),
    do: {:error, :price_unavailable}

  defp fetch_indexer_series(%Asset{indexer: :PREFIXADO}, _from_date, _to_date), do: {:ok, []}

  defp fetch_indexer_series(%Asset{indexer: indexer}, from_date, to_date) do
    case BrapiClient.fetch_macro_indicator(Atom.to_string(indexer), from_date, to_date) do
      {:ok, indexer_series} -> {:ok, indexer_series}
      {:error, _reason} -> {:error, :price_unavailable}
    end
  end

  defp resolve_provider(opts, key) do
    case Keyword.get(opts, key) || Application.get_env(:solaris_core, key) do
      nil -> {:error, :price_unavailable}
      provider -> {:ok, provider}
    end
  end

  defp external_symbol(%Asset{external_symbol: nil, ticker: ticker}), do: ticker
  defp external_symbol(%Asset{external_symbol: external_symbol}), do: external_symbol
end
