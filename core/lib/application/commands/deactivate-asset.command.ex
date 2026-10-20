defmodule SolarisCore.Application.Commands.DeactivateAsset do
  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo

  @spec execute(String.t()) :: {:ok, Asset.t()} | {:error, term()}
  def execute(asset_id) do
    with {:ok, asset} <- AssetRepo.get(asset_id),
         :ok <- ensure_no_open_investment(asset.id),
         {:ok, updated} <- AssetRepo.update(Asset.deactivate(asset)) do
      {:ok, updated}
    end
  end

  defp ensure_no_open_investment(asset_id) do
    if InvestmentRepo.open_for_asset?(asset_id) do
      {:error, :asset_has_open_investment}
    else
      :ok
    end
  end
end
