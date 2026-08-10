defmodule SolarisCore.Application.Commands.UpdatePlannedTransaction do
  alias SolarisCore.Finance.Domain.PlannedTransaction
  alias SolarisCore.Finance.Domain.CategoryCompatibilityPolicy
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(String.t(), map()) :: {:ok, PlannedTransaction.t()} | {:error, term()}
  def execute(id, attrs) do
    with {:ok, existing} <- PlannedTransactionRepo.get(id),
         {:ok, category} <- fetch_category_if_present(attrs, existing),
         :ok <- validate_category_compatibility(category, attrs, existing),
         merged <- build_transaction_attrs(existing, attrs),
         {:ok, updated} <- PlannedTransaction.new(merged) do
      PlannedTransactionRepo.update(updated)
    end
  end

  defp fetch_category_if_present(%{category_id: id}, _existing) when not is_nil(id),
    do: CategoryRepo.get(id)

  defp fetch_category_if_present(_attrs, _existing), do: {:ok, nil}

  defp validate_category_compatibility(nil, _attrs, _existing), do: :ok

  defp validate_category_compatibility(category, attrs, existing) do
    type = Map.get(attrs, :type, existing.type)
    CategoryCompatibilityPolicy.validate_compatibility(category, type)
  end

  defp build_transaction_attrs(existing, attrs) do
    existing
    |> Map.from_struct()
    |> Map.merge(attrs)
  end
end
