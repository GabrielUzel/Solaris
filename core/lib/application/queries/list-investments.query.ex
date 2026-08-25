defmodule SolarisCore.Application.Queries.ListInvestments do
  alias SolarisCore.Finance.Domain.Investment
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo

  @spec execute(map()) :: {:ok, [Investment.t()]}
  def execute(filters \\ %{}) do
    repo_filters =
      []
      |> maybe_put(:status, filters[:status])
      |> maybe_put(:asset_type, filters[:asset_type])

    {:ok, InvestmentRepo.list(repo_filters)}
  end

  defp maybe_put(acc, _key, nil), do: acc
  defp maybe_put(acc, key, value), do: [{key, value} | acc]
end
