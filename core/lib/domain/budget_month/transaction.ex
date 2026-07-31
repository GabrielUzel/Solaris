defmodule SolarisCore.Finance.Domain.BudgetMonth.Transaction do
  alias SolarisCore.Finance.Domain.PaymentMethod
  alias SolarisCore.Finance.Domain.CategoryCompatibilityPolicy

  @enforce_keys [:id, :description, :amount, :type, :category_id, :payment_method, :occurred_on, :origin, :status]
  defstruct [
    :id,
    :planned_transaction_id,
    :description,
    :amount,
    :type,
    :category_id,
    :payment_method,
    :occurred_on,
    :origin,
    :status,
    :notes,
    :created_at,
    :updated_at
  ]

  @types [:income, :expense]
  @origins [:manual, :planned]
  @statuses [:expected, :confirmed, :skipped]

  def new(attrs) do
    with :ok <- validate_type(attrs[:type]),
         :ok <- validate_amount(attrs[:amount]),
         :ok <- PaymentMethod.validate(attrs[:payment_method]),
         :ok <- validate_origin(attrs[:origin]),
         :ok <- validate_status(attrs[:status]),
         :ok <- validate_occurred_on(attrs[:occurred_on]),
         :ok <- validate_category_compatibility(attrs[:category], attrs[:type]) do
      {:ok, struct!(__MODULE__, Map.delete(attrs, :category))}
    end
  end

  defp validate_type(type) when type in @types, do: :ok
  defp validate_type(_), do: {:error, :invalid_transaction_type}

  defp validate_amount(amount) when is_integer(amount) and amount > 0, do: :ok
  defp validate_amount(_), do: {:error, :amount_must_be_positive_integer}

  defp validate_origin(origin) when origin in @origins, do: :ok
  defp validate_origin(_), do: {:error, :invalid_origin}

  defp validate_status(status) when status in @statuses, do: :ok
  defp validate_status(_), do: {:error, :invalid_status}

  defp validate_occurred_on(%Date{}), do: :ok
  defp validate_occurred_on(_), do: {:error, :occurred_on_required}

  defp validate_category_compatibility(nil, _type), do: :ok
  defp validate_category_compatibility(category, type), do: CategoryCompatibilityPolicy.validate_compatibility(category, type)
end
