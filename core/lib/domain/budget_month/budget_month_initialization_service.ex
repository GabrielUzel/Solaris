defmodule SolarisCore.Finance.Domain.BudgetMonthInitializationService do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Finance.Domain.BudgetMonth.Transaction
  alias SolarisCore.Finance.Domain.PlannedTransaction

  def initialize(%BudgetMonth{} = budget_month, planned_transactions)
      when is_list(planned_transactions) do
    month_date = Date.new!(budget_month.reference_year, budget_month.reference_month, 1)

    applicable =
      Enum.filter(planned_transactions, fn pt ->
        PlannedTransaction.applies_to_month?(pt, month_date)
      end)

    already_materialized_ids =
      budget_month.transactions
      |> Enum.map(& &1.planned_transaction_id)
      |> MapSet.new()

    pending =
      Enum.reject(applicable, fn pt ->
        MapSet.member?(already_materialized_ids, pt.id)
      end)

    Enum.reduce_while(pending, {:ok, budget_month}, fn pt, {:ok, acc} ->
      day = PlannedTransaction.effective_day_for_month(pt, month_date)
      occurred_on = Date.new!(budget_month.reference_year, budget_month.reference_month, day)

      transaction_attrs = %{
        id: Ecto.UUID.generate(),
        planned_transaction_id: pt.id,
        description: pt.description,
        amount: pt.amount,
        type: pt.type,
        category_id: pt.category_id,
        payment_method: pt.payment_method,
        occurred_on: occurred_on,
        origin: :planned,
        status: :expected,
        notes: pt.notes
      }

      case Transaction.new(transaction_attrs) do
        {:ok, transaction} ->
          case BudgetMonth.add_transaction(acc, transaction) do
            {:ok, updated} -> {:cont, {:ok, updated}}
            error -> {:halt, error}
          end

        error ->
          {:halt, error}
      end
    end)
  end
end
