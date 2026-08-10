defmodule SolarisCore.Finance.Domain.BudgetMonth.Transaction do
  alias SolarisCore.Finance.Domain.PaymentMethod

  @enforce_keys [
    :id,
    :description,
    :expected_amount,
    :type,
    :category_id,
    :payment_method,
    :occurred_on,
    :origin,
    :status
  ]
  defstruct [
    :id,
    :planned_transaction_id,
    :description,
    :expected_amount,
    :actual_amount,
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
  @statuses [:expected, :paid, :skipped]

  def new(attrs) do
    with :ok <- validate_type(attrs[:type]),
         :ok <- validate_expected_amount(attrs[:expected_amount]),
         :ok <- validate_actual_amount(attrs[:actual_amount]),
         :ok <- PaymentMethod.validate(attrs[:payment_method]),
         :ok <- validate_origin(attrs[:origin]),
         :ok <- validate_status(attrs[:status]),
         :ok <- validate_occurred_on(attrs[:occurred_on]),
         :ok <- validate_category_compatibility(attrs[:category_id], attrs[:type]),
         :ok <- validate_amounts_against_status(attrs[:status], attrs[:actual_amount]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  def pay(%__MODULE__{} = transaction, actual_amount \\ nil) do
    resolved_actual_amount = actual_amount || transaction.expected_amount

    with :ok <- validate_expected_amount(transaction.expected_amount),
         :ok <- validate_actual_amount(resolved_actual_amount) do
      {:ok, %{transaction | status: :paid, actual_amount: resolved_actual_amount}}
    end
  end

  def skip(%__MODULE__{} = transaction) do
    {:ok, %{transaction | status: :skipped, actual_amount: nil}}
  end

  def variance_amount(%__MODULE__{actual_amount: nil}), do: 0

  def variance_amount(%__MODULE__{actual_amount: actual_amount, expected_amount: expected_amount}) do
    actual_amount - expected_amount
  end

  defp validate_type(type) when type in @types, do: :ok
  defp validate_type(_), do: {:error, :invalid_transaction_type}

  defp validate_expected_amount(amount) when is_integer(amount) and amount > 0, do: :ok
  defp validate_expected_amount(_), do: {:error, :expected_amount_must_be_positive_integer}

  defp validate_actual_amount(nil), do: :ok
  defp validate_actual_amount(amount) when is_integer(amount) and amount > 0, do: :ok
  defp validate_actual_amount(_), do: {:error, :actual_amount_must_be_positive_integer}

  defp validate_origin(origin) when origin in @origins, do: :ok
  defp validate_origin(_), do: {:error, :invalid_origin}

  defp validate_status(status) when status in @statuses, do: :ok
  defp validate_status(_), do: {:error, :invalid_status}

  defp validate_occurred_on(%Date{}), do: :ok
  defp validate_occurred_on(_), do: {:error, :occurred_on_required}

  defp validate_category_compatibility(nil, _type), do: :ok

  defp validate_category_compatibility(category_id, type) do
    case category_id do
      nil -> :ok
      _ -> validate_category_loaded(type)
    end
  end

  defp validate_category_loaded(_type), do: :ok

  defp validate_amounts_against_status(:expected, nil), do: :ok

  defp validate_amounts_against_status(:paid, amount) when is_integer(amount) and amount > 0,
    do: :ok

  defp validate_amounts_against_status(:skipped, nil), do: :ok

  defp validate_amounts_against_status(:expected, _),
    do: {:error, :expected_transaction_cannot_have_actual_amount}

  defp validate_amounts_against_status(:paid, _),
    do: {:error, :paid_transaction_requires_actual_amount}

  defp validate_amounts_against_status(:skipped, _),
    do: {:error, :skipped_transaction_cannot_have_actual_amount}
end
