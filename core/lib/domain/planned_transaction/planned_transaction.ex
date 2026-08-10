defmodule SolarisCore.Finance.Domain.PlannedTransaction do
  alias SolarisCore.Finance.Domain.PaymentMethod

  @enforce_keys [
    :id,
    :description,
    :amount,
    :type,
    :category_id,
    :payment_method,
    :day_of_month,
    :starts_on,
    :active
  ]
  defstruct [
    :id,
    :description,
    :amount,
    :type,
    :category_id,
    :payment_method,
    :day_of_month,
    :starts_on,
    :active,
    :notes,
    :created_at,
    :updated_at
  ]

  @types [:income, :expense]

  def new(attrs) do
    with :ok <- validate_type(attrs[:type]),
         :ok <- validate_amount(attrs[:amount]),
         :ok <- PaymentMethod.validate(attrs[:payment_method]),
         :ok <- validate_day_of_month(attrs[:day_of_month]),
         :ok <- validate_starts_on(attrs[:starts_on]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  def applies_to_month?(%__MODULE__{active: true, starts_on: starts_on}, %Date{} = month_date) do
    Date.compare(Date.beginning_of_month(month_date), Date.beginning_of_month(starts_on)) != :lt
  end

  def applies_to_month?(%__MODULE__{active: false}, _month_date), do: false

  def effective_day_for_month(%__MODULE__{day_of_month: day}, %Date{} = month_date) do
    min(day, Date.days_in_month(month_date))
  end

  defp validate_type(type) when type in @types, do: :ok
  defp validate_type(_), do: {:error, :invalid_planned_transaction_type}

  defp validate_amount(amount) when is_integer(amount) and amount > 0, do: :ok
  defp validate_amount(_), do: {:error, :amount_must_be_positive_integer}

  defp validate_day_of_month(day) when is_integer(day) and day >= 1 and day <= 31, do: :ok
  defp validate_day_of_month(_), do: {:error, :invalid_day_of_month}

  defp validate_starts_on(%Date{}), do: :ok
  defp validate_starts_on(_), do: {:error, :starts_on_required}
end
