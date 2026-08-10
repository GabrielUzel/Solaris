defmodule SolarisCore.Application.Commands.CreatePlannedTransaction do
  alias Ecto.UUID
  alias SolarisCore.Finance.Domain.PlannedTransaction
  alias SolarisCore.Finance.Domain.CategoryCompatibilityPolicy
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo
  alias SolarisCore.Infrastructure.Repositories.PlannedTransactionRepo

  @spec execute(map()) :: {:ok, PlannedTransaction.t()} | {:error, term()}
  def execute(attrs) do
    attrs =
      attrs
      |> Map.put_new(:id, UUID.generate())
      |> Map.put_new(:active, true)

    with {:ok, category} <- fetch_category_if_present(attrs),
         :ok <- validate_category_compatibility(category, attrs),
         {:ok, planned} <- PlannedTransaction.new(attrs) do
      PlannedTransactionRepo.create(planned)
    end
  end

  defp fetch_category_if_present(%{category_id: id}) when not is_nil(id), do: CategoryRepo.get(id)
  defp fetch_category_if_present(_attrs), do: {:ok, nil}

  defp validate_category_compatibility(nil, _attrs), do: :ok

  defp validate_category_compatibility(category, attrs) do
    CategoryCompatibilityPolicy.validate_compatibility(category, Map.get(attrs, :type))
  end
end
