defmodule SolarisCoreWeb.Api.Loader do
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo

  def new do
    Dataloader.new()
    |> Dataloader.add_source(:investments, Dataloader.KV.new(&fetch/2))
  end

  defp fetch(:assets_by_id, asset_ids) do
    [ids: asset_ids]
    |> AssetRepo.list()
    |> Map.new(&{&1.id, &1})
  end

  defp fetch(:transactions_by_investment, investment_ids) do
    grouped =
      investment_ids
      |> InvestmentTransactionRepo.list_by_investment_ids()
      |> Enum.group_by(& &1.investment_id)

    Map.new(investment_ids, fn id -> {id, Map.get(grouped, id, [])} end)
  end
end
