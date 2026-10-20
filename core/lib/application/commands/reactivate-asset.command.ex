defmodule SolarisCore.Application.Commands.ReactivateAsset do
  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Infrastructure.Repositories.AssetRepo

  @spec execute(String.t()) :: {:ok, Asset.t()} | {:error, term()}
  def execute(asset_id) do
    with {:ok, asset} <- AssetRepo.get(asset_id),
         {:ok, updated} <- AssetRepo.update(Asset.reactivate(asset)) do
      {:ok, updated}
    end
  end
end
