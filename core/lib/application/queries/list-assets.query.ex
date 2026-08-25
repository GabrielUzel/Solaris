defmodule SolarisCore.Application.Queries.ListAssets do
  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Infrastructure.Repositories.AssetRepo

  @spec execute(map()) :: {:ok, [Asset.t()]}
  def execute(filters \\ %{}) do
    repo_filters =
      []
      |> maybe_put(:asset_type, filters[:asset_type])
      |> maybe_put(:market, filters[:market])

    {:ok, AssetRepo.list(repo_filters)}
  end

  defp maybe_put(acc, _key, nil), do: acc
  defp maybe_put(acc, key, value), do: [{key, value} | acc]
end
