defmodule SolarisCoreWeb.Api.Resolvers.PortfolioResolver do
  alias SolarisCore.Application.Queries.GetBenchmarkComparison
  alias SolarisCore.Application.Queries.GetIncomeHistory
  alias SolarisCore.Application.Queries.GetInvestmentValueHistory
  alias SolarisCore.Application.Queries.GetPortfolioSummary

  def portfolio_summary(_parent, _args, _resolution) do
    {:ok, summary} = GetPortfolioSummary.execute()

    {:ok,
     %{
       total_invested_cents: summary.total_invested_cents,
       total_market_value_cents: summary.total_market_value_cents,
       total_profit_loss_cents: summary.total_profit_loss_cents,
       allocation_by_type: summary.allocation_by_type,
       ranking_by_return: Enum.map(summary.ranking_by_return, &rank_to_map/1)
     }}
  end

  def investment_value_history(_parent, args, _resolution) do
    opts =
      []
      |> maybe_put(:from, args[:from])
      |> maybe_put(:to, args[:to])

    case GetInvestmentValueHistory.execute(args[:investment_id], opts) do
      {:ok, points} -> {:ok, points}
      {:error, :not_found} -> {:error, "Investimento não encontrado"}
      {:error, reason} -> {:error, reason}
    end
  end

  def income_history(_parent, args, _resolution) do
    opts =
      []
      |> maybe_put(:investment_id, args[:investment_id])
      |> maybe_put(:from, args[:from])
      |> maybe_put(:to, args[:to])

    GetIncomeHistory.execute(opts)
  end

  def benchmark_comparison(_parent, args, _resolution) do
    case GetBenchmarkComparison.execute(args[:investment_id], benchmark: args[:benchmark]) do
      {:ok, comparison} ->
        {:ok,
         %{
           asset_return_percent: Decimal.to_float(comparison.asset_return_percent),
           benchmark_return_percent: Decimal.to_float(comparison.benchmark_return_percent)
         }}

      {:error, :not_found} ->
        {:error, "Investimento não encontrado"}

      {:error, :benchmark_unavailable} ->
        {:error, "Dados do benchmark indisponíveis para o período solicitado"}

      {:error, :price_unavailable} ->
        {:error, "Cotação do ativo indisponível para o período solicitado"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp rank_to_map(rank) do
    %{
      investment_id: rank.investment_id,
      asset_ticker: rank.asset_ticker,
      twr_percent: nullable_float(rank.twr_percent),
      xirr_percent: nullable_float(rank.xirr_percent)
    }
  end

  defp nullable_float({:error, _reason}), do: nil
  defp nullable_float(nil), do: nil
  defp nullable_float(%Decimal{} = value), do: Decimal.to_float(value)
  defp nullable_float(value) when is_float(value), do: value
  defp nullable_float(value) when is_integer(value), do: value * 1.0

  defp maybe_put(acc, _key, nil), do: acc
  defp maybe_put(acc, key, value), do: [{key, value} | acc]
end
