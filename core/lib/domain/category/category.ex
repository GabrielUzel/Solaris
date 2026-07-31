defmodule SolarisCore.Finance.Domain.Category do
  @enforce_keys [:id, :name, :type]
  defstruct [:id, :name, :type, :color, :created_at, :updated_at]

  @types [:income, :expense]

  def new(attrs) do
    with :ok <- validate_type(attrs[:type]),
         :ok <- validate_name(attrs[:name]),
         :ok <- validate_color(attrs[:color]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  defp validate_type(type) when type in @types, do: :ok
  defp validate_type(_), do: {:error, :invalid_category_type}

  defp validate_name(name) when is_binary(name) and byte_size(name) > 0, do: :ok
  defp validate_name(_), do: {:error, :name_required}

  defp validate_color(color) when is_binary(color) and byte_size(color) > 0, do: :ok
  defp validate_color(_), do: {:error, :color_required}
end
