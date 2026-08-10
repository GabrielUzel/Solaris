defmodule SolarisCore.Application.Commands.UpdateManualTransaction do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Finance.Domain.BudgetMonth.Transaction
  alias SolarisCore.Finance.Domain.CategoryCompatibilityPolicy
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(String.t(), String.t(), map()) :: {:ok, term()} | {:error, term()}
  def execute(budget_month_id, transaction_id, attrs) do
    with {:ok, budget_month} <- BudgetMonthRepo.get(budget_month_id),
         {:ok, existing_transaction} <- fetch_transaction(budget_month, transaction_id),
         {:ok, category} <- fetch_category_if_present(attrs),
         :ok <- validate_category_compatibility(category, attrs, existing_transaction),
         merged <- build_transaction_attrs(existing_transaction, attrs),
         {:ok, updated_transaction} <- Transaction.new(merged),
         {:ok, updated_budget_month} <-
           replace_transaction(budget_month, transaction_id, updated_transaction) do
      BudgetMonthRepo.update(updated_budget_month)
    end
  end

  defp fetch_transaction(%BudgetMonth{transactions: transactions}, transaction_id) do
    case Enum.find(transactions, &(&1.id == transaction_id)) do
      nil -> {:error, :transaction_not_found}
      %Transaction{} = transaction -> {:ok, transaction}
    end
  end

  defp fetch_category_if_present(%{category_id: id}) when not is_nil(id), do: CategoryRepo.get(id)
  defp fetch_category_if_present(_attrs), do: {:ok, nil}

  defp validate_category_compatibility(nil, _attrs, _existing_transaction), do: :ok

  defp validate_category_compatibility(category, attrs, existing_transaction) do
    type = Map.get(attrs, :type, existing_transaction.type)
    CategoryCompatibilityPolicy.validate_compatibility(category, type)
  end

  defp build_transaction_attrs(existing_transaction, attrs) do
    existing_transaction
    |> Map.from_struct()
    |> Map.merge(attrs)
    |> Map.put(:origin, :manual)
  end

  defp replace_transaction(%BudgetMonth{} = budget_month, transaction_id, updated_transaction) do
    updated_transactions =
      Enum.map(budget_month.transactions, fn transaction ->
        if transaction.id == transaction_id, do: updated_transaction, else: transaction
      end)

    {:ok, %{budget_month | transactions: updated_transactions}}
  end
end
