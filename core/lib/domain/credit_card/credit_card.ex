defmodule SolarisCore.Finance.Domain.CreditCard do
  @enforce_keys [:id, :name, :bank, :closing_day, :due_day]
  defstruct [:id, :name, :bank, :closing_day, :due_day, :active, :created_at, :updated_at]

  def new(attrs) do
    with :ok <- validate_name(attrs[:name]),
         :ok <- validate_bank(attrs[:bank]),
         :ok <- validate_closing_day(attrs[:closing_day]),
         :ok <- validate_due_day(attrs[:due_day]),
         :ok <- validate_active(attrs[:active]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  def deactivate(%__MODULE__{} = card) do
    {:ok, %{card | active: false}}
  end

  defp validate_name(name) when is_binary(name) and byte_size(name) > 0, do: :ok
  defp validate_name(_), do: {:error, :name_required}

  defp validate_bank(bank) when is_binary(bank) and byte_size(bank) > 0, do: :ok
  defp validate_bank(_), do: {:error, :bank_required}

  defp validate_closing_day(day) when is_integer(day) and day >= 1 and day <= 28, do: :ok
  defp validate_closing_day(_), do: {:error, :invalid_closing_day}

  defp validate_due_day(day) when is_integer(day) and day >= 1 and day <= 28, do: :ok
  defp validate_due_day(_), do: {:error, :invalid_due_day}

  defp validate_active(nil), do: :ok
  defp validate_active(active) when is_boolean(active), do: :ok
  defp validate_active(_), do: {:error, :invalid_active}
end
