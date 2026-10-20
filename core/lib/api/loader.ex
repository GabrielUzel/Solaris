defmodule SolarisCoreWeb.Api.Loader do
  alias SolarisCore.Infrastructure.Repositories.AssetRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo

  def new do
    Dataloader.new()
    |> Dataloader.add_source(:investments, Dataloader.KV.new(&fetch/2))
  end

  defp fetch(:assets_by_id, asset_ids) do
    [ids: MapSet.to_list(asset_ids)]
    |> AssetRepo.list()
    |> Map.new(&{&1.id, &1})
  end

  defp fetch(:transactions_by_investment, investment_ids) do
    investment_ids_list = MapSet.to_list(investment_ids)

    grouped =
      investment_ids_list
      |> InvestmentTransactionRepo.list_by_investment_ids()
      |> Enum.group_by(& &1.investment_id)

    Map.new(investment_ids_list, fn id -> {id, Map.get(grouped, id, [])} end)
  end
end
