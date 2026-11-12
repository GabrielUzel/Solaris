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

  defp fetch_category_if_present(%{category_id: id}, _existing) when is_binary(id) do
    case String.trim(id) do
      "" -> {:ok, nil}
      category_id -> fetch_category(category_id)
    end
  end

  defp fetch_category_if_present(%{category_id: id}, _existing) when not is_nil(id),
    do: fetch_category(id)

  defp fetch_category_if_present(_attrs, _existing), do: {:ok, nil}

  defp fetch_category(id) do
    case CategoryRepo.get(id) do
      {:error, :not_found} -> {:error, :category_not_found}
      result -> result
    end
  end

  defp validate_category_compatibility(nil, _attrs, _existing), do: :ok

  defp validate_category_compatibility(category, attrs, existing) do
    type = Map.get(attrs, :type, existing.type)
    CategoryCompatibilityPolicy.validate_compatibility(category, type)
  end

  defp build_transaction_attrs(existing, attrs) do
    existing
    |> Map.from_struct()
    |> Map.merge(drop_blank_category(attrs))
  end

  # Categoria em branco no update significa "manter a atual", não apagar.
  defp drop_blank_category(%{category_id: id} = attrs) when is_binary(id) do
    if String.trim(id) == "", do: Map.delete(attrs, :category_id), else: attrs
  end

  defp drop_blank_category(attrs), do: attrs
end
