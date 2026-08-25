defmodule SolarisCore.Application.Queries.GetInvestmentAnalysis do
  @moduledoc """
  Orquestra a analise completa de um investimento: busca investment, asset,
  transacoes e proventos via repositorios, resolve preco/cambio/serie de
  indexador via providers (cache-first, ver `AssetPriceProviderImpl`) e
  delega os calculos para `InvestmentAnalysisRules` (funcoes puras).

  Uso: `execute(investment_id, opts \\ [])`.

  Opcoes:

  - `:reference_date` — data de referencia da analise (default: `closed_at`
    quando o investment esta fechado, senao a data de hoje);
  - `:asset_price_provider` — sobrescreve
    `config :solaris_core, :asset_price_provider` (util em testes);
  - `:exchange_rate_provider` — sobrescreve
    `config :solaris_core, :exchange_rate_provider` (util em testes).

  Campos que dependem de preco de mercado (`current_market_value_cents`,
  `profit_loss_cents`, `roi_percent`, `twr_percent`, `xirr_percent`) recebem
  `{:error, :price_unavailable}` quando o preco nao pode ser resolvido (ex:
  `us_market` sem retorno do Finnhub, provider nao configurado, serie de
  indexador indisponivel). Os demais campos sao sempre retornados — a query
  nunca lanca excecao por falta de preco.

  Observacoes por tipo de ativo:

  - Renda fixa: o valor atual vem da marcacao na curva, com a serie diaria
    do indexador obtida via `BrapiClient` (`PREFIXADO` dispensa serie). Para
    o TWR, cada transacao recebe quantidade sintetica
    `amount_invested_cents / 100` e o preco injetado e o valor marcado de
    uma base de 100 centavos desde a abertura — aproximacao cujo erro de
    arredondamento e desprezivel na base escolhida.
  - Ativos em USD: o valor de mercado e convertido para BRL pela cotacao da
    data de referencia. O TWR e calculado em centavos de USD (moeda nativa,
    sem efeito cambial); o XIRR usa fluxos em BRL e, portanto, inclui o
    efeito cambial.
  """

  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Finance.Domain.Investment
  alias SolarisCore.Finance.Domain.InvestmentAnalysisRules
  alias SolarisCore.Finance.Domain.InvestmentRules
  alias SolarisCore.Finance.Domain.InvestmentTransaction
  alias SolarisCore.Infrastructure.MarketData.BrapiClient
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.DividendIncomeRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo

  @usd_brl_pair "USD-BRL"
  @curve_price_base_cents 100

  @spec execute(binary(), keyword()) :: {:ok, map()} | {:error, term()}
  def execute(investment_id, opts \\ []) do
    with {:ok, investment} <- InvestmentRepo.get(investment_id),
         {:ok, asset} <- AssetRepo.get(investment.asset_id) do
      reference_date = Keyword.get(opts, :reference_date) || default_reference_date(investment)
      transactions = InvestmentTransactionRepo.list_by_investment(investment.id)
      incomes = DividendIncomeRepo.list_by_investment(investment.id)

      total_invested_cents = InvestmentRules.total_invested_cents(transactions)

      net_income_cents =
        Enum.reduce(incomes, 0, fn income, acc -> income.net_amount_cents + acc end)

      analysis = %{
        investment_id: investment.id,
        asset_id: asset.id,
        reference_date: reference_date,
        status: investment.status,
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

      case resolve_market_context(asset, investment, transactions, reference_date, opts) do
        {:ok, market_context} ->
          {:ok,
           Map.merge(
             analysis,
             price_dependent_analysis(
               investment,
               transactions,
               total_invested_cents,
               reference_date,
               market_context
             )
           )}

        {:error, :price_unavailable} ->
          {:ok, Map.merge(analysis, price_unavailable_fields())}
      end
    end
  end

  defp default_reference_date(%Investment{closed_at: %Date{} = closed_at}), do: closed_at
  defp default_reference_date(%Investment{}), do: Date.utc_today()

  defp price_unavailable_fields do
    %{
      current_market_value_cents: {:error, :price_unavailable},
      profit_loss_cents: {:error, :price_unavailable},
      roi_percent: {:error, :price_unavailable},
      twr_percent: {:error, :price_unavailable},
      xirr_percent: {:error, :price_unavailable}
    }
  end

  defp price_dependent_analysis(
         investment,
         transactions,
         total_invested_cents,
         reference_date,
         market_context
       ) do
    market_value_cents = market_context.market_value_cents

    %{
      current_market_value_cents: market_value_cents,
      profit_loss_cents: market_value_cents - total_invested_cents,
      roi_percent:
        field_value(InvestmentAnalysisRules.roi_percent(market_value_cents, total_invested_cents)),
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

  defp resolve_market_context(%Asset{} = asset, _investment, transactions, reference_date, opts) do
    with {:ok, price_provider} <- resolve_provider(opts, :asset_price_provider),
         {:ok, close_price_cents} <- fetch_price(price_provider, asset, reference_date),
         {:ok, valuation} <- build_valuation(asset, close_price_cents, reference_date, opts) do
      {:ok,
       %{
         market_value_cents:
           InvestmentAnalysisRules.current_market_value_cents(asset, transactions, valuation),
         twr_transactions: transactions,
         price_lookup: fn date -> fetch_price(price_provider, asset, date) end
       }}
    end
  end

  defp build_valuation(%Asset{market: :us_market}, close_price_cents, reference_date, opts) do
    with {:ok, rate_provider} <- resolve_provider(opts, :exchange_rate_provider),
         {:ok, rate} <- fetch_rate(rate_provider, reference_date) do
      {:ok, %{unit_price_cents: close_price_cents, exchange_rate: rate}}
    end
  end

  defp build_valuation(%Asset{}, close_price_cents, _reference_date, _opts) do
    {:ok, %{close_price_cents: close_price_cents}}
  end

  defp fetch_price(provider, asset, date) do
    case provider.fetch_price(asset, date) do
      {:ok, close_price_cents} -> {:ok, close_price_cents}
      {:error, _reason} -> {:error, :price_unavailable}
    end
  end

  defp fetch_rate(provider, date) do
    case provider.fetch_rate(@usd_brl_pair, date) do
      {:ok, rate} -> {:ok, rate}
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

  defp field_value({:ok, value}), do: value
  defp field_value({:error, reason}), do: {:error, reason}
end
