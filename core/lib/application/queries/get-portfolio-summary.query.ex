defmodule SolarisCore.Application.Queries.GetPortfolioSummary do
  @moduledoc """
  Agrega todas as `investments` abertas em um resumo consolidado em centavos
  de BRL.

  Evita N+1: carrega assets, transacoes, proventos e snapshots de preco em
  lote (uma query por entidade) antes de calcular a analise de cada posicao.
  Para datas sem snapshot em cache, cai no provider (cache-first) — o caso
  comum de carteira ja sincronizada nao dispara chamadas de rede por ativo.

  Campos que dependem de preco de mercado (`current_market_value_cents`,
  `profit_loss_cents`, `roi_percent`, `twr_percent`, `xirr_percent`) podem
  vir como `{:error, :price_unavailable}` quando o preco nao pode ser
  resolvido (ex: ativo `us_market` sem retorno do Finnhub). Esses valores
  sao excluidos dos totais de mercado e da alocacao, mas nao derrubam o
  resumo dos demais ativos.

  Opcoes:

  - `:reference_date` — data de referencia (default: hoje);
  - `:asset_price_provider` / `:exchange_rate_provider` — sobrescrevem a
    config (util em testes).
  """

  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Finance.Domain.Investment
  alias SolarisCore.Finance.Domain.InvestmentAnalysisRules
  alias SolarisCore.Finance.Domain.InvestmentRules
  alias SolarisCore.Finance.Domain.InvestmentTransaction
  alias SolarisCore.Infrastructure.MarketData.BrapiClient
  alias SolarisCore.Infrastructure.Repositories.AssetPriceSnapshotRepo
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.DividendIncomeRepo
  alias SolarisCore.Infrastructure.Repositories.ExchangeRateSnapshotRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo

  @usd_brl_pair "USD-BRL"
  @curve_price_base_cents 100

  @spec execute(keyword()) :: {:ok, map()}
  def execute(opts \\ []) do
    reference_date = Keyword.get(opts, :reference_date) || Date.utc_today()
    investments = InvestmentRepo.list_open()

    analyses = analyze_investments(investments, reference_date, opts)

    total_invested_cents =
      Enum.reduce(analyses, 0, fn analysis, acc -> analysis.total_invested_cents + acc end)

    total_market_value_cents =
      Enum.reduce(analyses, 0, fn analysis, acc ->
        case analysis.current_market_value_cents do
          {:error, _reason} -> acc
          value -> value + acc
        end
      end)

    {:ok,
     %{
       total_invested_cents: total_invested_cents,
       total_market_value_cents: total_market_value_cents,
       total_profit_loss_cents: total_market_value_cents - total_invested_cents,
       allocation_by_type: allocation_by_type(analyses, total_market_value_cents),
       ranking_by_return: ranking_by_return(analyses)
     }}
  end

  defp analyze_investments(investments, reference_date, opts) do
    asset_ids = Enum.map(investments, & &1.asset_id)

    assets = AssetRepo.list(ids: asset_ids) |> Map.new(&{&1.id, &1})

    transactions_by_investment =
      investments
      |> InvestmentTransactionRepo.list_by_investment_ids()
      |> Enum.group_by(& &1.investment_id)

    incomes_by_investment =
      investments
      |> DividendIncomeRepo.list_by_investment_ids()
      |> Enum.group_by(& &1.investment_id)

    min_date =
      case investments do
        [] -> reference_date
        _ -> investments |> Enum.map(& &1.opened_at) |> Enum.min()
      end

    price_lookup =
      asset_ids
      |> AssetPriceSnapshotRepo.list_by_asset_ids_and_date_range(min_date, reference_date)
      |> Map.new(&{{&1.asset_id, &1.reference_date}, &1.close_price_cents})

    rate_lookup =
      ExchangeRateSnapshotRepo.list_by_pair_and_date_range(
        @usd_brl_pair,
        min_date,
        reference_date
      )
      |> Map.new(&{&1.reference_date, &1.rate})

    Enum.map(investments, fn investment ->
      asset = Map.fetch!(assets, investment.asset_id)
      transactions = Map.get(transactions_by_investment, investment.id, [])
      incomes = Map.get(incomes_by_investment, investment.id, [])

      compute_analysis(
        investment,
        asset,
        transactions,
        incomes,
        reference_date,
        price_lookup,
        rate_lookup,
        opts
      )
    end)
  end

  defp compute_analysis(
         investment,
         asset,
         transactions,
         incomes,
         reference_date,
         price_lookup,
         rate_lookup,
         opts
       ) do
    total_invested_cents = InvestmentRules.total_invested_cents(transactions)

    net_income_cents =
      Enum.reduce(incomes, 0, fn income, acc -> income.net_amount_cents + acc end)

    base = %{
      investment_id: investment.id,
      asset_id: asset.id,
      asset_ticker: asset.ticker,
      asset_type: asset.asset_type,
      total_invested_cents: total_invested_cents,
      current_quantity: InvestmentRules.current_quantity(transactions),
      average_price_cents: InvestmentRules.average_price_cents(transactions),
      net_income_cents: net_income_cents,
      dividend_yield_accumulated:
        field_value(
          InvestmentAnalysisRules.dividend_yield_accumulated(
            net_income_cents,
            total_invested_cents
          )
        )
    }

    case resolve_market_context(
           asset,
           investment,
           transactions,
           reference_date,
           price_lookup,
           rate_lookup,
           opts
         ) do
      {:ok, market_context} ->
        market_value_cents = market_context.market_value_cents

        Map.merge(base, %{
          current_market_value_cents: market_value_cents,
          profit_loss_cents: market_value_cents - total_invested_cents,
          roi_percent:
            field_value(
              InvestmentAnalysisRules.roi_percent(market_value_cents, total_invested_cents)
            ),
          twr_percent:
            field_value(
              InvestmentAnalysisRules.twr_percent(
                market_context.twr_transactions,
                market_context.price_lookup,
                reference_date
              )
            ),
          xirr_percent:
            field_value(
              InvestmentAnalysisRules.xirr_percent(
                cash_flows(transactions, investment, market_value_cents, reference_date)
              )
            )
        })

      {:error, :price_unavailable} ->
        Map.merge(base, price_unavailable_fields())
    end
  end

  defp price_unavailable_fields do
    %{
      current_market_value_cents: {:error, :price_unavailable},
      profit_loss_cents: {:error, :price_unavailable},
      roi_percent: {:error, :price_unavailable},
      twr_percent: {:error, :price_unavailable},
      xirr_percent: {:error, :price_unavailable}
    }
  end

  defp cash_flows(transactions, investment, market_value_cents, reference_date) do
    flows =
      Enum.map(transactions, fn transaction ->
        if InvestmentTransaction.entry?(transaction) do
          {transaction.transaction_date, -transaction.amount_invested_cents}
        else
          {transaction.transaction_date, transaction.amount_invested_cents}
        end
      end)

    if Investment.open?(investment) do
      flows ++ [{reference_date, market_value_cents}]
    else
      flows
    end
  end

  defp resolve_market_context(
         %Asset{asset_type: :fixed_income} = asset,
         investment,
         transactions,
         reference_date,
         _price_lookup,
         _rate_lookup,
         _opts
       ) do
    with {:ok, indexer_series} <-
           fetch_indexer_series(asset, investment.opened_at, reference_date) do
      market_value_cents =
        InvestmentAnalysisRules.current_market_value_cents(asset, transactions, %{
          indexer_series: indexer_series,
          reference_date: reference_date
        })

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

      {:ok,
       %{
         market_value_cents: market_value_cents,
         twr_transactions: Enum.map(transactions, &with_curve_quantity/1),
         price_lookup: price_lookup
       }}
    end
  end

  defp resolve_market_context(
         %Asset{} = asset,
         _investment,
         transactions,
         reference_date,
         price_lookup,
         rate_lookup,
         opts
       ) do
    with {:ok, close_price_cents} <- fetch_price(asset, reference_date, price_lookup, opts),
         {:ok, valuation} <-
           build_valuation(asset, close_price_cents, reference_date, rate_lookup, opts) do
      {:ok,
       %{
         market_value_cents:
           InvestmentAnalysisRules.current_market_value_cents(asset, transactions, valuation),
         twr_transactions: transactions,
         price_lookup: fn date -> fetch_price(asset, date, price_lookup, opts) end
       }}
    end
  end

  defp build_valuation(
         %Asset{market: :us_market},
         close_price_cents,
         reference_date,
         rate_lookup,
         opts
       ) do
    with {:ok, rate} <- fetch_rate(reference_date, rate_lookup, opts) do
      {:ok, %{unit_price_cents: close_price_cents, exchange_rate: rate}}
    end
  end

  defp build_valuation(%Asset{}, close_price_cents, _reference_date, _rate_lookup, _opts) do
    {:ok, %{close_price_cents: close_price_cents}}
  end

  defp fetch_price(asset, date, price_lookup, opts) do
    case Map.get(price_lookup, {asset.id, date}) do
      nil -> fetch_price_from_provider(asset, date, opts)
      price_cents -> {:ok, price_cents}
    end
  end

  defp fetch_price_from_provider(asset, date, opts) do
    case resolve_provider(opts, :asset_price_provider) do
      {:ok, provider} ->
        case provider.fetch_price(asset, date) do
          {:ok, price_cents} -> {:ok, price_cents}
          {:error, _reason} -> {:error, :price_unavailable}
        end

      {:error, :price_unavailable} ->
        {:error, :price_unavailable}
    end
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

  defp allocation_by_type(analyses, total_market_value_cents) do
    analyses
    |> Enum.filter(fn analysis ->
      match?({:error, _reason}, analysis.current_market_value_cents) == false
    end)
    |> Enum.group_by(& &1.asset_type)
    |> Enum.map(fn {asset_type, items} ->
      total_value_cents =
        Enum.reduce(items, 0, fn item, acc -> item.current_market_value_cents + acc end)

      %{
        asset_type: asset_type,
        total_value_cents: total_value_cents,
        percentage: percentage(total_value_cents, total_market_value_cents)
      }
    end)
  end

  defp ranking_by_return(analyses) do
    analyses
    |> Enum.map(fn analysis ->
      %{
        investment_id: analysis.investment_id,
        asset_ticker: analysis.asset_ticker,
        twr_percent: analysis.twr_percent,
        xirr_percent: analysis.xirr_percent
      }
    end)
    |> Enum.sort_by(&rank_sort_key/1, :desc)
  end

  defp rank_sort_key(rank) do
    case rank.twr_percent do
      {:error, _reason} -> -1.0
      %Decimal{} = value -> Decimal.to_float(value)
      value when is_float(value) -> value
      value when is_integer(value) -> value * 1.0
    end
  end

  defp percentage(_part, 0), do: 0.0
  defp percentage(part, total), do: part / total * 100

  defp field_value({:ok, value}), do: value
  defp field_value({:error, reason}), do: {:error, reason}
end
