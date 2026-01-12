defmodule SolarisCore.Finance.Domain.Transaction do
  defstruct [:id, :account_id, :amount, :type, :date, :description, :category_id]

  @types [:income, :expense]

  def new(attrs) do
    with :ok <- validate_type(attrs.type),
         :ok <- validate_amount(attrs.amount) do
      struct!(__MODULE__, attrs)
    end
  end

  defp validate_type(type) when type in @types, do: :ok
  defp validate_type(_), do: {:error, :invalid_type}

  defp validate_amount(amount) when amount > 0, do: :ok
  defp validate_amount(_), do: {:error, :amount_must_be_positive}
end
