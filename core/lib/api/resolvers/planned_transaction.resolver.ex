defmodule SolarisCoreWeb.Api.Resolvers.PlannedTransactionResolver do
  alias SolarisCore.Application.Commands.CreatePlannedTransaction
  alias SolarisCore.Application.Commands.UpdatePlannedTransaction
  alias SolarisCore.Application.Commands.DeactivatePlannedTransaction
  alias SolarisCore.Application.Commands.ReactivatePlannedTransaction
  alias SolarisCore.Application.Commands.DeletePlannedTransaction
  alias SolarisCore.Application.Queries.GetPlannedTransactionById
  alias SolarisCore.Application.Queries.ListActivePlannedTransactions

  import SolarisCoreWeb.Api.ErrorMessages, only: [translate: 1]

  def get_planned_transaction_by_id(_parent, %{id: id}, _resolution) do
    GetPlannedTransactionById.execute(id) |> translate()
  end

  def list_active_planned_transactions(_parent, _args, _resolution) do
    ListActivePlannedTransactions.execute() |> translate()
  end

  def create_planned_transaction(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> CreatePlannedTransaction.execute()
    |> translate()
  end

  def update_planned_transaction(_parent, %{id: id, input: input}, _resolution) do
    UpdatePlannedTransaction.execute(id, to_domain_attrs(input)) |> translate()
  end

  def deactivate_planned_transaction(_parent, %{id: id}, _resolution) do
    DeactivatePlannedTransaction.execute(id) |> translate()
  end

  def reactivate_planned_transaction(_parent, %{id: id}, _resolution) do
    ReactivatePlannedTransaction.execute(id) |> translate()
  end

  def delete_planned_transaction(_parent, %{id: id}, _resolution) do
    case DeletePlannedTransaction.execute(id) do
      {:ok, _} -> {:ok, true}
      error -> translate(error)
    end
  end

  defp to_domain_attrs(input) do
    Map.new(input, fn {k, v} -> {k, v} end)
  end
end
