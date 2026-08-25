defmodule SolarisCoreWeb.Api.Resolvers.AssetResolver do
  alias SolarisCore.Application.Queries.GetAssetById
  alias SolarisCore.Application.Queries.ListAssets

  def asset(_parent, %{id: id}, _resolution) do
    case GetAssetById.execute(id) do
      {:error, :not_found} -> {:error, "Ativo não encontrado"}
      result -> result
    end
  end

  def assets(_parent, args, _resolution) do
    ListAssets.execute(%{asset_type: args[:asset_type], market: args[:market]})
  end

  def indexer_rate_percent(asset, _args, _resolution) do
    {:ok, decimal_to_float(asset.indexer_rate_percent)}
  end

  defp decimal_to_float(nil), do: nil
  defp decimal_to_float(%Decimal{} = value), do: Decimal.to_float(value)
end
