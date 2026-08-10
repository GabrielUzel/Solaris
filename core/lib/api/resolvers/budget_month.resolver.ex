defmodule SolarisCoreWeb.Api.Resolvers.BudgetMonthResolver do
  alias SolarisCore.Application.Commands.CreateManualTransaction
  alias SolarisCore.Application.Commands.DeleteManualTransaction
  alias SolarisCore.Application.Commands.UpdateManualTransaction
  alias SolarisCore.Application.Commands.EnsureBudgetMonthByReference
  alias SolarisCore.Application.Commands.EnsureCurrentBudgetMonth
  alias SolarisCore.Application.Commands.InitializeBudgetMonthFromPlannedTransactions
  alias SolarisCore.Application.Commands.OpenBudgetMonth
  alias SolarisCore.Application.Commands.PayTransaction
  alias SolarisCore.Application.Commands.SkipTransaction
  alias SolarisCore.Application.Queries.GetBudgetMonthByReference
  alias SolarisCore.Application.Queries.GetBudgetMonthPreview
  alias SolarisCore.Application.Queries.GetBudgetMonthSummary
  alias SolarisCore.Application.Queries.GetCurrentBudgetMonth
  alias SolarisCore.Application.Queries.ListBudgetMonthTransactions

  def get_current_budget_month(_parent, _args, _resolution) do
    GetCurrentBudgetMonth.execute()
  end

  def get_budget_month_by_reference(_parent, %{year: year, month: month}, _resolution) do
    GetBudgetMonthByReference.execute(year, month)
  end

  def list_budget_month_transactions(_parent, %{budget_month_id: id} = args, _resolution) do
    filters = Map.get(args, :filters, %{})
    ListBudgetMonthTransactions.execute(id, filters)
  end

  def get_budget_month_summary(_parent, %{budget_month_id: id}, _resolution) do
    GetBudgetMonthSummary.execute(id)
  end

  def get_budget_month_preview(_parent, %{year: year, month: month}, _resolution) do
    GetBudgetMonthPreview.execute(year, month)
  end

  def open_budget_month(_parent, %{year: year, month: month}, _resolution) do
    OpenBudgetMonth.execute(year, month)
  end

  def ensure_current_budget_month(_parent, _args, _resolution) do
    EnsureCurrentBudgetMonth.execute()
  end

  def ensure_budget_month_by_reference(_parent, %{year: year, month: month}, _resolution) do
    EnsureBudgetMonthByReference.execute(year, month)
  end

  def initialize_budget_month_from_planned_transactions(
        _parent,
        %{budget_month_id: id},
        _resolution
      ) do
    InitializeBudgetMonthFromPlannedTransactions.execute(id)
  end

  def create_manual_transaction(
        _parent,
        %{budget_month_id: id, input: input},
        _resolution
      ) do
    CreateManualTransaction.execute(id, to_domain_attrs(input))
  end

  def pay_transaction(
        _parent,
        %{budget_month_id: bm_id, transaction_id: tx_id} = args,
        _resolution
      ) do
    actual_amount =
      case args do
        %{input: %{actual_amount: value}} -> value
        _ -> nil
      end

    PayTransaction.execute(bm_id, tx_id, actual_amount)
  end

  def skip_transaction(
        _parent,
        %{budget_month_id: bm_id, transaction_id: tx_id},
        _resolution
      ) do
    SkipTransaction.execute(bm_id, tx_id)
  end

  def update_manual_transaction(
        _parent,
        %{budget_month_id: bm_id, transaction_id: tx_id, input: input},
        _resolution
      ) do
    UpdateManualTransaction.execute(bm_id, tx_id, to_domain_attrs(input))
  end

  def delete_manual_transaction(
        _parent,
        %{budget_month_id: bm_id, transaction_id: tx_id},
        _resolution
      ) do
    case DeleteManualTransaction.execute(bm_id, tx_id) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  defp to_domain_attrs(input) do
    Map.new(input, fn {k, v} -> {k, v} end)
  end
end
