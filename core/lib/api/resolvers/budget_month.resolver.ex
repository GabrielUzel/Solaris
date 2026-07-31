defmodule SolarisCoreWeb.Api.Resolvers.BudgetMonthResolver do
  alias SolarisCore.Application.Commands.OpenBudgetMonth
  alias SolarisCore.Application.Commands.InitializeBudgetMonthFromPlannedTransactions
  alias SolarisCore.Application.Commands.AddManualTransactionToBudgetMonth
  alias SolarisCore.Application.Commands.ConfirmBudgetMonthTransaction
  alias SolarisCore.Application.Commands.SkipBudgetMonthTransaction
  alias SolarisCore.Application.Commands.RemoveManualTransactionFromBudgetMonth
  alias SolarisCore.Application.Queries.GetCurrentBudgetMonth
  alias SolarisCore.Application.Queries.GetBudgetMonthByReference
  alias SolarisCore.Application.Queries.ListBudgetMonthTransactions
  alias SolarisCore.Application.Queries.GetBudgetMonthSummary

  def get_current_budget_month(_parent, _args, _resolution) do
    GetCurrentBudgetMonth.execute()
  end

  def get_budget_month_by_reference(_parent, %{year: year, month: month}, _resolution) do
    GetBudgetMonthByReference.execute(year, month)
  end

  def list_budget_month_transactions(_parent, %{budget_month_id: id}, _resolution) do
    ListBudgetMonthTransactions.execute(id)
  end

  def get_budget_month_summary(_parent, %{budget_month_id: id}, _resolution) do
    GetBudgetMonthSummary.execute(id)
  end

  def open_budget_month(_parent, %{year: year, month: month}, _resolution) do
    OpenBudgetMonth.execute(year, month)
  end

  def initialize_budget_month_from_planned_transactions(_parent, %{budget_month_id: id}, _resolution) do
    InitializeBudgetMonthFromPlannedTransactions.execute(id)
  end

  def add_manual_transaction_to_budget_month(_parent, %{budget_month_id: id, input: input}, _resolution) do
    AddManualTransactionToBudgetMonth.execute(id, Map.new(input, fn {k, v} -> {k, v} end))
  end

  def confirm_budget_month_transaction(_parent, %{budget_month_id: bm_id, transaction_id: tx_id}, _resolution) do
    ConfirmBudgetMonthTransaction.execute(bm_id, tx_id)
  end

  def skip_budget_month_transaction(_parent, %{budget_month_id: bm_id, transaction_id: tx_id}, _resolution) do
    SkipBudgetMonthTransaction.execute(bm_id, tx_id)
  end

  def remove_manual_transaction_from_budget_month(_parent, %{budget_month_id: bm_id, transaction_id: tx_id}, _resolution) do
    case RemoveManualTransactionFromBudgetMonth.execute(bm_id, tx_id) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end
end
