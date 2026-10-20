defmodule SolarisCore.Application.Queries.GetIncomeHistory do
  @moduledoc """
  Historico de proventos (dividendos, JCP, rendimentos de FII e juros de
  renda fixa) agregado por mes, em centavos de BRL.

  Carrega os proventos de todas as `investments` em lote (uma query) e agrupa
  por `payment_date` no formato `YYYY-MM`. Apenas meses com proventos sao
  retornados. Quando `:investment_id` nao e informado, agrega sobre todas as
  `investments` (abertas e encerradas).

  Opcoes:

  - `:from` / `:to` — intervalo de `payment_date` (default: sem limite);
  - `:investment_id` — restringe a uma investment (default: todas).
  """

  alias SolarisCore.Infrastructure.Repositories.DividendIncomeRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo

  @spec execute(keyword()) :: {:ok, [map()]}
  def execute(opts \\ []) do
    investment_ids = resolve_investment_ids(opts[:investment_id])

    incomes =
      investment_ids
      |> DividendIncomeRepo.list_by_investment_ids()
      |> filter_period(opts[:from], opts[:to])

    {:ok, group_by_month(incomes)}
  end

  defp resolve_investment_ids(nil) do
    InvestmentRepo.list()
    |> Enum.map(& &1.id)
  end

  defp resolve_investment_ids(investment_id), do: [investment_id]

  defp filter_period(incomes, nil, nil), do: incomes

  defp filter_period(incomes, from, to) do
    Enum.filter(incomes, fn income ->
      (is_nil(from) or Date.compare(income.payment_date, from) != :lt) and
        (is_nil(to) or Date.compare(income.payment_date, to) != :gt)
    end)
  end

  defp group_by_month(incomes) do
    incomes
    |> Enum.group_by(fn income -> Calendar.strftime(income.payment_date, "%Y-%m") end)
    |> Enum.sort_by(fn {month, _incomes} -> month end)
    |> Enum.map(fn {month, month_incomes} ->
      %{
        period: month,
        total_net_amount_cents:
          Enum.reduce(month_incomes, 0, fn income, acc -> income.net_amount_cents + acc end)
      }
    end)
  end
end
