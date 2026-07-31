defmodule SolarisCore.Finance.Domain.CategoryCompatibilityPolicy do
  alias SolarisCore.Finance.Domain.Category

  def compatible?(%Category{type: category_type}, item_type), do: category_type == item_type

  def validate_compatibility(%Category{type: category_type}, item_type) do
    if category_type == item_type do
      :ok
    else
      {:error, :category_type_mismatch}
    end
  end
end
