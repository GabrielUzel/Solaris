defmodule SolarisCore.Application.Queries.GetAssetById do
  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Infrastructure.Repositories.AssetRepo

  @spec execute(String.t()) :: {:ok, Asset.t()} | {:error, :not_found}
  def execute(id) do
    AssetRepo.get(id)
  end
end
