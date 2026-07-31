defmodule SolarisCore.Application.Commands.CreatePlannedTransaction do
  alias SolarisCore.Finance.Domain.PlannedTransaction
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(map()) :: {:ok, PlannedTransaction.t()} | {:error, term()}
  def execute(attrs) do
    with {:ok, category} <- fetch_category_if_present(attrs),
         enriched <- maybe_put_category(attrs, category),
         {:ok, planned} <- PlannedTransaction.new(enriched) do
      PlannedTransactionRepo.create(planned)
    end
  end

  defp fetch_category_if_present(%{category_id: id}) when not is_nil(id) do
    CategoryRepo.get(id)
  end

  defp fetch_category_if_present(_attrs), do: {:ok, nil}

  defp maybe_put_category(attrs, nil), do: attrs
  defp maybe_put_category(attrs, category), do: Map.put(attrs, :category, category)
end
