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
    :credit_card_id,
    :installment_group_id,
    :installment_number,
    :installments_total,
    :purchased_on,
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
         :ok <- validate_amounts_against_status(attrs[:status], attrs[:actual_amount]),
         :ok <- validate_credit_card_fields(attrs) do
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

  defp validate_credit_card_fields(attrs) do
    case attrs[:payment_method] do
      :credit_card -> validate_credit_card_attrs(attrs)
      _ -> validate_no_credit_card_fields(attrs)
    end
  end

  defp validate_no_credit_card_fields(attrs) do
    fields = [
      attrs[:credit_card_id],
      attrs[:installment_group_id],
      attrs[:installment_number],
      attrs[:installments_total],
      attrs[:purchased_on]
    ]

    if Enum.all?(fields, &is_nil/1), do: :ok, else: {:error, :credit_card_fields_not_allowed}
  end

  defp validate_credit_card_attrs(attrs) do
    with :ok <- validate_credit_card_type(attrs[:type]),
         :ok <- validate_purchased_on(attrs[:purchased_on]) do
      validate_installments(attrs)
    end
  end

  defp validate_credit_card_type(:expense), do: :ok
  defp validate_credit_card_type(_), do: {:error, :credit_card_only_for_expenses}

  defp validate_purchased_on(nil), do: :ok
  defp validate_purchased_on(%Date{}), do: :ok
  defp validate_purchased_on(_), do: {:error, :invalid_purchased_on}

  defp validate_installments(attrs) do
    case attrs[:credit_card_id] do
      nil -> validate_legacy_installments(attrs)
      _ -> validate_card_installments(attrs)
    end
  end

  defp validate_legacy_installments(attrs) do
    fields = [
      attrs[:installment_group_id],
      attrs[:installment_number],
      attrs[:installments_total]
    ]

    if Enum.all?(fields, &is_nil/1), do: :ok, else: {:error, :credit_card_required}
  end

  defp validate_card_installments(attrs) do
    with :ok <- validate_installments_total(attrs[:installments_total]),
         :ok <-
           validate_installment_number(attrs[:installment_number], attrs[:installments_total]) do
      validate_installment_group(attrs[:installment_group_id], attrs[:installments_total])
    end
  end

  defp validate_installments_total(total) when is_integer(total) and total >= 1, do: :ok
  defp validate_installments_total(_), do: {:error, :invalid_installments_total}

  defp validate_installment_number(number, total)
       when is_integer(number) and number >= 1 and number <= total,
       do: :ok

  defp validate_installment_number(_number, _total), do: {:error, :invalid_installment_number}

  defp validate_installment_group(group_id, total)
       when total > 1 and is_binary(group_id) and byte_size(group_id) > 0,
       do: :ok

  defp validate_installment_group(_group_id, total) when total > 1,
    do: {:error, :installment_group_required}

  defp validate_installment_group(nil, 1), do: :ok
  defp validate_installment_group(_group_id, 1), do: {:error, :installment_group_must_be_nil}
end
