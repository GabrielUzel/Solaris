defmodule SolarisCore.Application.Commands.UpdatePlannedTransaction do
  alias SolarisCore.Finance.Domain.PlannedTransaction
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(String.t(), map()) :: {:ok, PlannedTransaction.t()} | {:error, term()}
  def execute(id, attrs) do
    with {:ok, existing} <- PlannedTransactionRepo.get(id),
         merged <- Map.merge(Map.from_struct(existing), attrs),
         {:ok, category} <- fetch_category_if_changed(merged),
         enriched <- maybe_put_category(merged, category),
         {:ok, updated} <- PlannedTransaction.new(enriched) do
      PlannedTransactionRepo.update(updated)
    end
  end

  defp fetch_category_if_changed(%{category_id: id}) when not is_nil(id) do
    CategoryRepo.get(id)
  end

  defp fetch_category_if_changed(_attrs), do: {:ok, nil}

  defp maybe_put_category(attrs, nil), do: attrs
  defp maybe_put_category(attrs, category), do: Map.put(attrs, :category, category)
end
