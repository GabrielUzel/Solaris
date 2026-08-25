defmodule SolarisCore.Finance.Domain.InvestmentAnalysisRules do
  @moduledoc """
  Funcoes puras de analise de investimentos: valor de mercado, marcacao na
  curva, ROI, TWR, XIRR e dividend yield acumulado.

  Convencoes:

  - Todo valor monetario de entrada e saida e um inteiro em centavos; nenhuma
    soma monetaria passa por `Float`. A unica excecao e o XIRR, um metodo
    numerico iterativo cujo resultado e uma taxa (razao), nao um valor
    monetario: os centavos entram como inteiros em cada termo do VPL e so a
    taxa final vira `Decimal`.
  - Percentuais (ROI, TWR, XIRR, yield) sao retornados como `Decimal`.
  - Arredondamento monetario e sempre half-up e acontece apenas no resultado
    final de cada composicao, nunca entre iteracoes diarias — a composicao
    diaria inteira e feita em `Decimal` (exata) e so o valor final de cada
    transacao e arredondado para centavos.

  Nenhuma funcao deste modulo acessa `Repo` ou faz chamadas HTTP: precos,
  cambio e series de indicadores chegam por parametro ou por funcoes
  injetadas (ex: o `price_lookup_fn` do TWR).

  Marcacao na curva (renda fixa), por transacao de entrada:

  - `CDI`/`SELIC`: compoe diariamente `1 + (taxa_diaria/100) * (contratada/100)`.
    A serie recebida traz a taxa diaria em percentual (ex: `0.054` = 0,054%
    ao dia) e a taxa contratada e o percentual sobre o indexador (ex: `110` =
    110% do CDI). Taxa contratada `nil` equivale a 100% do indexador.
  - `IPCA`: compoe a inflacao acumulada do periodo `produto(1 + valor/100)`
    (a serie do IPCA e tipicamente mensal) com o spread contratado anual em
    base 252: `(1 + spread/100)^(dias/252)`. Spread `nil` equivale a 0.
  - `PREFIXADO`: `(1 + taxa/100)^(dias/252)`. A base 252 dias uteis e a
    convencao de mercado para titulos prefixados brasileiros; como o dominio
    nao tem calendario de dias uteis, `dias` conta dias corridos — uma
    aproximacao documentada. O expoente fracionario e calculado uma unica vez
    via `:math.pow/2` e convertido de volta para `Decimal`, sem acumulo de
    erro entre iteracoes.

  TWR e aproximado por evento (cada transacao com quantidade e a data de
  referencia), nao intraday: o retorno de cada subperiodo e
  `(valor_antes_do_fluxo - valor_apos_fluxo_anterior) / valor_apos_fluxo_anterior`,
  encadeado geometricamente. Subperiodos sem capital em risco (base zero)
  sao ignorados.
  """

  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Finance.Domain.InvestmentRules
  alias SolarisCore.Finance.Domain.InvestmentTransaction

  @type indicator_point :: %{date: Date.t(), value: Decimal.t()}
  @type price_lookup_fn :: (Date.t() -> {:ok, integer()} | {:error, term()})
  @type cash_flow :: {Date.t(), integer()}

  @type valuation ::
          %{close_price_cents: integer()}
          | %{unit_price_cents: integer(), exchange_rate: Decimal.t()}
          | %{indexer_series: [indicator_point()], reference_date: Date.t()}

  @hundred Decimal.new(100)
  @business_days_per_year 252

  @newton_initial_guess 0.1
  @newton_max_iterations 50
  @newton_tolerance 1.0e-10
  @bisection_low -0.9999
  @bisection_high 10.0
  @bisection_max_iterations 200
  @bisection_tolerance 1.0e-7

  @doc """
  Valor de mercado da posicao em centavos de BRL, a partir dos dados ja
  resolvidos pela camada de aplicacao (`valuation`):

  - Renda fixa: `%{indexer_series: ..., reference_date: ...}` — soma a
    marcacao na curva de cada transacao de entrada;
  - Ativo em USD: `%{unit_price_cents: ..., exchange_rate: ...}` —
    `round(quantidade * preco_em_centavos_de_usd * cambio)`;
  - Demais ativos: `%{close_price_cents: ...}` — `quantidade * preco`.
  """
  @spec current_market_value_cents(Asset.t(), [InvestmentTransaction.t()], valuation()) ::
          integer()
  def current_market_value_cents(asset, transactions, valuation)

  def current_market_value_cents(%Asset{asset_type: :fixed_income} = asset, transactions, %{
        indexer_series: indexer_series,
        reference_date: reference_date
      }) do
    transactions
    |> Enum.filter(&InvestmentTransaction.entry?/1)
    |> Enum.map(fn transaction ->
      curve_marked_value_cents(
        transaction.amount_invested_cents,
        asset.indexer,
        indexer_series,
        asset.indexer_rate_percent,
        transaction.transaction_date,
        reference_date
      )
    end)
    |> Enum.sum()
  end

  def current_market_value_cents(%Asset{market: :us_market}, transactions, %{
        unit_price_cents: unit_price_cents,
        exchange_rate: %Decimal{} = exchange_rate
      }) do
    transactions
    |> InvestmentRules.current_quantity()
    |> Decimal.mult(Decimal.new(unit_price_cents))
    |> Decimal.mult(exchange_rate)
    |> round_cents()
  end

  def current_market_value_cents(%Asset{}, transactions, %{close_price_cents: close_price_cents}) do
    transactions
    |> InvestmentRules.current_quantity()
    |> Decimal.mult(Decimal.new(close_price_cents))
    |> round_cents()
  end

  @doc """
  Marcacao na curva de um unico aporte de renda fixa, em centavos. A serie
  do indexador (`indexer_series`) e filtrada para o intervalo
  `[from_date, to_date]`. Ver o moduledoc para as formulas por indexador.
  """
  @spec curve_marked_value_cents(
          integer(),
          :CDI | :SELIC | :IPCA | :PREFIXADO,
          [indicator_point()],
          Decimal.t() | nil,
          Date.t(),
          Date.t()
        ) :: integer()
  def curve_marked_value_cents(
        amount_invested_cents,
        indexer,
        indexer_series,
        contracted_rate_percent,
        from_date,
        to_date
      )

  def curve_marked_value_cents(
        amount_invested_cents,
        indexer,
        indexer_series,
        contracted_rate,
        from_date,
        to_date
      )
      when indexer in [:CDI, :SELIC] do
    contracted = percent_or(contracted_rate, 100)

    factor =
      indexer_series
      |> filter_period(from_date, to_date)
      |> Enum.reduce(Decimal.new(1), fn %{value: daily_percent}, acc ->
        daily_rate =
          daily_percent
          |> Decimal.div(@hundred)
          |> Decimal.mult(Decimal.div(contracted, @hundred))

        Decimal.mult(acc, Decimal.add(Decimal.new(1), daily_rate))
      end)

    amount_invested_cents
    |> Decimal.new()
    |> Decimal.mult(factor)
    |> round_cents()
  end

  def curve_marked_value_cents(
        amount_invested_cents,
        :IPCA,
        indexer_series,
        contracted_rate,
        from_date,
        to_date
      ) do
    inflation_factor =
      indexer_series
      |> filter_period(from_date, to_date)
      |> Enum.reduce(Decimal.new(1), fn %{value: period_percent}, acc ->
        Decimal.mult(acc, Decimal.add(Decimal.new(1), Decimal.div(period_percent, @hundred)))
      end)

    spread_factor =
      contracted_rate
      |> percent_or(0)
      |> annual_factor(Date.diff(to_date, from_date))

    amount_invested_cents
    |> Decimal.new()
    |> Decimal.mult(inflation_factor)
    |> Decimal.mult(spread_factor)
    |> round_cents()
  end

  def curve_marked_value_cents(
        amount_invested_cents,
        :PREFIXADO,
        _indexer_series,
        contracted_rate,
        from_date,
        to_date
      ) do
    factor =
      contracted_rate
      |> percent_or(0)
      |> annual_factor(Date.diff(to_date, from_date))

    amount_invested_cents
    |> Decimal.new()
    |> Decimal.mult(factor)
    |> round_cents()
  end

  @doc """
  ROI em percentual: `(valor_atual - total_investido) / total_investido * 100`.
  A subtracao e feita em inteiros (centavos); a conversao para `Decimal`
  acontece apenas na divisao final.
  """
  @spec roi_percent(integer(), integer()) :: {:ok, Decimal.t()} | {:error, :no_investment}
  def roi_percent(_current_market_value_cents, 0), do: {:error, :no_investment}

  def roi_percent(current_market_value_cents, total_invested_cents)
      when is_integer(current_market_value_cents) and is_integer(total_invested_cents) do
    roi =
      (current_market_value_cents - total_invested_cents)
      |> Decimal.new()
      |> Decimal.div(Decimal.new(total_invested_cents))
      |> Decimal.mult(@hundred)

    {:ok, roi}
  end

  @doc """
  Dividend yield acumulado em percentual:
  `proventos_liquidos / total_investido * 100`.
  """
  @spec dividend_yield_accumulated(integer(), integer()) ::
          {:ok, Decimal.t()} | {:error, :no_investment}
  def dividend_yield_accumulated(_net_income_cents_sum, 0), do: {:error, :no_investment}

  def dividend_yield_accumulated(net_income_cents_sum, total_invested_cents)
      when is_integer(net_income_cents_sum) and is_integer(total_invested_cents) do
    yield =
      net_income_cents_sum
      |> Decimal.new()
      |> Decimal.div(Decimal.new(total_invested_cents))
      |> Decimal.mult(@hundred)

    {:ok, yield}
  end

  @doc """
  TWR (Time-Weighted Return) em percentual.

  `price_lookup_fn` e injetado pela camada de aplicacao e recebe uma data,
  retornando `{:ok, unit_price_cents}` na moeda nativa do ativo (ou
  `{:error, reason}`). Apenas transacoes com `quantity` participam; vendas
  entram com quantidade negativa. Aproximacao por evento, nao intraday.
  """
  @spec twr_percent([InvestmentTransaction.t()], price_lookup_fn(), Date.t()) ::
          {:ok, Decimal.t()} | {:error, term()}
  def twr_percent(transactions, price_lookup_fn, reference_date) do
    events =
      transactions
      |> Enum.filter(&(not is_nil(&1.quantity)))
      |> Enum.sort_by(& &1.transaction_date, Date)

    with {:ok, subperiod_returns} <- subperiod_returns(events, price_lookup_fn, reference_date) do
      {:ok, chain_returns(subperiod_returns)}
    end
  end

  defp subperiod_returns([], _price_lookup_fn, _reference_date), do: {:ok, []}

  defp subperiod_returns([first | rest], price_lookup_fn, reference_date) do
    with {:ok, initial_price_cents} <- price_lookup_fn.(first.transaction_date),
         {:ok, state} <-
           Enum.reduce_while(
             rest,
             {:ok, initial_state(first, initial_price_cents)},
             fn transaction, acc ->
               event_step(transaction, acc, price_lookup_fn)
             end
           ),
         {:ok, returns} <- final_subperiod(state, price_lookup_fn, reference_date) do
      {:ok, returns}
    end
  end

  defp initial_state(transaction, price_cents) do
    quantity = signed_quantity(transaction)

    %{
      quantity: quantity,
      market_value_cents: Decimal.mult(quantity, Decimal.new(price_cents)),
      last_date: transaction.transaction_date,
      returns: []
    }
  end

  defp event_step(transaction, {:ok, state}, price_lookup_fn) do
    case price_lookup_fn.(transaction.transaction_date) do
      {:ok, price_cents} ->
        price = Decimal.new(price_cents)
        market_value_before = Decimal.mult(state.quantity, price)

        returns =
          append_subperiod_return(state.returns, state.market_value_cents, market_value_before)

        quantity = Decimal.add(state.quantity, signed_quantity(transaction))

        {:cont,
         {:ok,
          %{
            quantity: quantity,
            market_value_cents: Decimal.mult(quantity, price),
            last_date: transaction.transaction_date,
            returns: returns
          }}}

      {:error, reason} ->
        {:halt, {:error, reason}}
    end
  end

  defp final_subperiod(state, price_lookup_fn, reference_date) do
    if Date.compare(reference_date, state.last_date) == :eq do
      {:ok, Enum.reverse(state.returns)}
    else
      case price_lookup_fn.(reference_date) do
        {:ok, price_cents} ->
          market_value = Decimal.mult(state.quantity, Decimal.new(price_cents))
          returns = append_subperiod_return(state.returns, state.market_value_cents, market_value)
          {:ok, Enum.reverse(returns)}

        {:error, reason} ->
          {:error, reason}
      end
    end
  end

  defp append_subperiod_return(returns, base_value_cents, end_value_cents) do
    if Decimal.compare(base_value_cents, 0) == :gt do
      [Decimal.div(Decimal.sub(end_value_cents, base_value_cents), base_value_cents) | returns]
    else
      returns
    end
  end

  defp chain_returns(subperiod_returns) do
    subperiod_returns
    |> Enum.reduce(Decimal.new(1), fn return, acc ->
      Decimal.mult(acc, Decimal.add(Decimal.new(1), return))
    end)
    |> Decimal.sub(Decimal.new(1))
    |> Decimal.mult(@hundred)
  end

  defp signed_quantity(%InvestmentTransaction{} = transaction) do
    if InvestmentTransaction.entry?(transaction),
      do: transaction.quantity,
      else: Decimal.negate(transaction.quantity)
  end

  @doc """
  XIRR (TIR) em percentual: taxa `r` que zera
  `soma(fluxo_i / (1 + r)^(dias_i/365))` para os fluxos
  `[{date, amount_cents}]` (aportes negativos, resgates e valor atual
  positivos).

  Resolve por Newton-Raphson (chute inicial 10%, ate 50 iteracoes) com
  fallback para bissecao no intervalo [-99,99%, 100000%]. Retorna
  `{:error, :xirr_not_converged}` quando nao converge ou quando nao ha
  fluxos com sinais opostos. Os centavos entram como inteiros em cada termo
  do VPL; apenas a taxa final vira `Decimal` — e a unica etapa deste modulo
  que usa aritmetica de ponto flutuante, por envolver expoentes fracionarios.
  """
  @spec xirr_percent([cash_flow()]) :: {:ok, Decimal.t()} | {:error, :xirr_not_converged}
  def xirr_percent(cash_flows) when is_list(cash_flows) do
    flows = Enum.sort_by(cash_flows, fn {date, _amount} -> date end, Date)

    with [{first_date, _} | _] <- flows,
         true <- mixed_signs?(flows) do
      periods =
        Enum.map(flows, fn {date, amount} -> {Date.diff(date, first_date) / 365, amount} end)

      try do
        case solve_rate(periods) do
          {:ok, rate} -> {:ok, rate_to_percent(rate)}
          error -> error
        end
      rescue
        ArithmeticError -> {:error, :xirr_not_converged}
      end
    else
      _ -> {:error, :xirr_not_converged}
    end
  end

  defp mixed_signs?(flows) do
    Enum.any?(flows, fn {_date, amount} -> amount > 0 end) and
      Enum.any?(flows, fn {_date, amount} -> amount < 0 end)
  end

  defp solve_rate(periods) do
    case newton_solve(periods, @newton_initial_guess, @newton_max_iterations) do
      {:ok, rate} -> {:ok, rate}
      :not_converged -> bisection_solve(periods)
    end
  end

  defp newton_solve(_periods, _rate, 0), do: :not_converged

  defp newton_solve(periods, rate, iterations_left) do
    value = npv(periods, rate)
    derivative = npv_derivative(periods, rate)

    if abs(derivative) < 1.0e-12 do
      :not_converged
    else
      next_rate = rate - value / derivative

      cond do
        next_rate <= -1.0 -> :not_converged
        abs(next_rate - rate) < @newton_tolerance -> {:ok, next_rate}
        true -> newton_solve(periods, next_rate, iterations_left - 1)
      end
    end
  end

  defp bisection_solve(periods) do
    low_value = npv(periods, @bisection_low)
    high_value = npv(periods, @bisection_high)

    if low_value * high_value > 0 do
      {:error, :xirr_not_converged}
    else
      rate =
        bisection_step(
          periods,
          @bisection_low,
          @bisection_high,
          low_value,
          @bisection_max_iterations
        )

      {:ok, rate}
    end
  end

  defp bisection_step(periods, low, high, low_value, iterations_left) do
    mid = (low + high) / 2
    mid_value = npv(periods, mid)

    cond do
      abs(mid_value) < @bisection_tolerance or iterations_left <= 0 ->
        mid

      low_value * mid_value < 0 ->
        bisection_step(periods, low, mid, low_value, iterations_left - 1)

      true ->
        bisection_step(periods, mid, high, mid_value, iterations_left - 1)
    end
  end

  defp npv(periods, rate) do
    Enum.reduce(periods, 0.0, fn {years, amount_cents}, acc ->
      acc + amount_cents * :math.pow(1 + rate, -years)
    end)
  end

  defp npv_derivative(periods, rate) do
    Enum.reduce(periods, 0.0, fn {years, amount_cents}, acc ->
      acc - years * amount_cents * :math.pow(1 + rate, -years - 1)
    end)
  end

  defp rate_to_percent(rate) do
    rate
    |> Kernel.*(100.0)
    |> Float.round(6)
    |> Decimal.from_float()
  end

  defp filter_period(indexer_series, from_date, to_date) do
    Enum.filter(indexer_series, fn %{date: date} ->
      Date.compare(date, from_date) != :lt and Date.compare(date, to_date) != :gt
    end)
  end

  defp percent_or(nil, default), do: Decimal.new(default)
  defp percent_or(%Decimal{} = percent, _default), do: percent
  defp percent_or(percent, _default) when is_integer(percent), do: Decimal.new(percent)

  defp annual_factor(%Decimal{} = rate_percent, days) do
    base = 1 + Decimal.to_float(rate_percent) / 100
    Decimal.from_float(:math.pow(base, days / @business_days_per_year))
  end

  defp round_cents(%Decimal{} = value) do
    value
    |> Decimal.round(0, :half_up)
    |> Decimal.to_integer()
  end
end
