defmodule SolarisCoreWeb.Api.Resolvers.PlannedTransactionResolver do
  alias SolarisCore.Application.Commands.CreatePlannedTransaction
  alias SolarisCore.Application.Commands.UpdatePlannedTransaction
  alias SolarisCore.Application.Commands.DeactivatePlannedTransaction
  alias SolarisCore.Application.Commands.ReactivatePlannedTransaction
  alias SolarisCore.Application.Commands.DeletePlannedTransaction
  alias SolarisCore.Application.Queries.GetPlannedTransactionById
  alias SolarisCore.Application.Queries.ListActivePlannedTransactions

  def get_planned_transaction_by_id(_parent, %{id: id}, _resolution) do
    GetPlannedTransactionById.execute(id)
  end

  def list_active_planned_transactions(_parent, _args, _resolution) do
    ListActivePlannedTransactions.execute()
  end

  def create_planned_transaction(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> CreatePlannedTransaction.execute()
  end

  def update_planned_transaction(_parent, %{id: id, input: input}, _resolution) do
    UpdatePlannedTransaction.execute(id, to_domain_attrs(input))
  end

  def deactivate_planned_transaction(_parent, %{id: id}, _resolution) do
    DeactivatePlannedTransaction.execute(id)
  end

  def reactivate_planned_transaction(_parent, %{id: id}, _resolution) do
    ReactivatePlannedTransaction.execute(id)
  end

  def delete_planned_transaction(_parent, %{id: id}, _resolution) do
    case DeletePlannedTransaction.execute(id) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  defp to_domain_attrs(input) do
    Map.new(input, fn {k, v} -> {k, v} end)
  end
end
