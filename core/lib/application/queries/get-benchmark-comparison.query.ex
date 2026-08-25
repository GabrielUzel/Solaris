defmodule SolarisCore.Application.Queries.GetBenchmarkComparison do
  @moduledoc """
  Compara o retorno (TWR) de uma `investment` com um indice de referencia
  (`CDI`, `IPCA` ou `IBOVESPA`) no mesmo periodo da posicao (de `opened_at`
  ate `closed_at` quando encerrada, ou ate hoje quando aberta).

  O retorno do ativo e o TWR calculado por `InvestmentAnalysisRules`. O
  retorno do benchmark e calculado sobre a serie do indice no periodo:

  - `CDI` / `IPCA`: serie diaria do indicador via brapi (`/api/v2/macro`) e
    composicao `produto(1 + taxa_diaria/100)`;
  - `IBOVESPA`: serie historica de fechamento via brapi
    (`/api/v2/stocks/historical`, simbolo `^BVSP`) e encadeamento dos
    retornos diarios.

  Todos os benchmarks vêm da brapi — nenhum depende do Finnhub.

  Se o benchmark pedido nao tiver dado disponivel no periodo, retorna
  `{:error, :benchmark_unavailable}` (o resolver traduz em erro GraphQL
  claro, nao em `nil` silencioso). Se o preco do ativo nao puder ser
  resolvido, retorna `{:error, :price_unavailable}`.

  Opcoes:

  - `:benchmark` — `:CDI`, `:IPCA` ou `:IBOVESPA` (default: `:CDI`);
  - `:reference_date` — data de referencia (default: hoje);
  - `:asset_price_provider` / `:exchange_rate_provider` — sobrescrevem a
    config (util em testes).
  """

  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Finance.Domain.InvestmentAnalysisRules
  alias SolarisCore.Finance.Domain.InvestmentTransaction
  alias SolarisCore.Infrastructure.MarketData.BrapiClient
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo

  @curve_price_base_cents 100
  @ibovespa_symbol "^BVSP"

  @spec execute(binary(), keyword()) :: {:ok, map()} | {:error, term()}
  def execute(investment_id, opts \\ []) do
    with {:ok, investment} <- InvestmentRepo.get(investment_id),
         {:ok, asset} <- AssetRepo.get(investment.asset_id) do
      benchmark = Keyword.get(opts, :benchmark) || :CDI
      reference_date = Keyword.get(opts, :reference_date) || Date.utc_today()
      from = investment.opened_at
      to = investment.closed_at || reference_date

      transactions = InvestmentTransactionRepo.list_by_investment(investment.id)

      with {:ok, asset_return_percent} <-
             asset_return(investment, asset, transactions, to, opts),
           {:ok, benchmark_return_percent} <-
             benchmark_return(benchmark, from, to) do
        {:ok,
         %{
           asset_return_percent: asset_return_percent,
           benchmark_return_percent: benchmark_return_percent
         }}
      end
    end
  end

  defp asset_return(
         investment,
         %Asset{asset_type: :fixed_income} = asset,
         transactions,
         to,
         _opts
       ) do
    with {:ok, indexer_series} <- fetch_indexer_series(asset, investment.opened_at, to) do
      price_lookup = fn date ->
        {:ok,
         InvestmentAnalysisRules.curve_marked_value_cents(
           @curve_price_base_cents,
           asset.indexer,
           indexer_series,
           asset.indexer_rate_percent,
           investment.opened_at,
           date
         )}
      end

      InvestmentAnalysisRules.twr_percent(
        Enum.map(transactions, &with_curve_quantity/1),
        price_lookup,
        to
      )
    end
  end

  defp asset_return(%Asset{} = asset, _investment, transactions, to, opts) do
    with {:ok, price_provider} <- resolve_provider(opts, :asset_price_provider) do
      price_lookup = fn date -> fetch_price(price_provider, asset, date) end
      InvestmentAnalysisRules.twr_percent(transactions, price_lookup, to)
    end
  end

  defp benchmark_return(benchmark, from, to) do
    case benchmark do
      :CDI -> macro_benchmark_return("CDI", from, to)
      :IPCA -> macro_benchmark_return("IPCA", from, to)
      :IBOVESPA -> ibovespa_return(from, to)
    end
  end

  defp macro_benchmark_return(indicator, from, to) do
    case BrapiClient.fetch_macro_indicator(indicator, from, to) do
      {:ok, indexer_series} ->
        factor =
          Enum.reduce(indexer_series, Decimal.new(1), fn %{value: daily_percent}, acc ->
            Decimal.mult(acc, Decimal.add(Decimal.new(1), Decimal.div(daily_percent, 100)))
          end)

        {:ok, Decimal.mult(Decimal.sub(factor, Decimal.new(1)), 100)}

      {:error, _reason} ->
        {:error, :benchmark_unavailable}
    end
  end

  defp ibovespa_return(from, to) do
    case BrapiClient.fetch_stock_historical(@ibovespa_symbol, from, to) do
      {:ok, points} ->
        returns =
          points
          |> Enum.sort_by(& &1.date, Date)
          |> Enum.chunk_every(2, 1, :discard)
          |> Enum.map(fn [prev, current] ->
            Decimal.div(
              Decimal.sub(Decimal.new(current.close_cents), Decimal.new(prev.close_cents)),
              Decimal.new(prev.close_cents)
            )
          end)

        case returns do
          [] ->
            {:error, :benchmark_unavailable}

          _ ->
            chained =
              Enum.reduce(returns, Decimal.new(1), fn return, acc ->
                Decimal.mult(acc, Decimal.add(Decimal.new(1), return))
              end)

            {:ok, Decimal.mult(Decimal.sub(chained, Decimal.new(1)), 100)}
        end

      {:error, _reason} ->
        {:error, :benchmark_unavailable}
    end
  end

  defp fetch_price(provider, asset, date) do
    case provider.fetch_price(asset, date) do
      {:ok, close_price_cents} -> {:ok, close_price_cents}
      {:error, _reason} -> {:error, :price_unavailable}
    end
  end

  defp resolve_provider(opts, key) do
    case Keyword.get(opts, key) || Application.get_env(:solaris_core, key) do
      nil -> {:error, :price_unavailable}
      provider -> {:ok, provider}
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

  defp with_curve_quantity(%InvestmentTransaction{quantity: nil} = transaction) do
    quantity =
      Decimal.div(Decimal.new(transaction.amount_invested_cents), @curve_price_base_cents)

    %{transaction | quantity: quantity}
  end

  defp with_curve_quantity(%InvestmentTransaction{} = transaction), do: transaction
end
