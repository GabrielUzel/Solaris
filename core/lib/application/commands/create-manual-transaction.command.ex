defmodule SolarisCore.Application.Commands.CreateManualTransaction do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Finance.Domain.BudgetMonth.Transaction
  alias SolarisCore.Finance.Domain.CategoryCompatibilityPolicy
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(String.t(), map()) :: {:ok, term()} | {:error, term()}
  def execute(budget_month_id, attrs) do
    with {:ok, budget_month} <- BudgetMonthRepo.get(budget_month_id),
         {:ok, category} <- fetch_category_if_present(attrs),
         :ok <- validate_category_compatibility(category, attrs),
         transaction_attrs <- build_transaction_attrs(attrs),
         {:ok, transaction} <- Transaction.new(transaction_attrs),
         {:ok, updated} <- BudgetMonth.add_transaction(budget_month, transaction) do
      BudgetMonthRepo.update(updated)
    end
  end

  defp fetch_category_if_present(%{category_id: id}) when not is_nil(id), do: CategoryRepo.get(id)
  defp fetch_category_if_present(_attrs), do: {:ok, nil}

  defp validate_category_compatibility(nil, _attrs), do: :ok

  defp validate_category_compatibility(category, attrs) do
    CategoryCompatibilityPolicy.validate_compatibility(category, Map.get(attrs, :type))
  end

  defp build_transaction_attrs(attrs) do
    attrs
    |> Map.put_new(:id, Ecto.UUID.generate())
    |> Map.put(:origin, :manual)
    |> Map.put_new_lazy(:status, fn ->
      if Map.get(attrs, :actual_amount), do: :paid, else: :expected
    end)
    |> Map.put_new_lazy(:expected_amount, fn ->
      Map.get(attrs, :actual_amount)
    end)
  end
end
