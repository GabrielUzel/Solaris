defmodule SolarisCore.Finance.Domain.Category do
  @enforce_keys [:id, :name, :type]
  defstruct [:id, :name, :type, :color]

  @types [:income, :expense]

  def new(attrs) do
    with :ok <- validate_type(attrs[:type]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  defp validate_type(type) when type in @types, do: :ok
  defp validate_type(_), do: {:error, :invalid_category_type}
end
