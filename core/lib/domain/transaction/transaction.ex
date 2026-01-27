defmodule SolarisCore.Finance.Domain.Transaction do
  alias SolarisCore.Finance.Domain.Recurrence

  defstruct [
    :id,
    :account_id,
    :amount,
    :type,
    :date,
    :description,
    :category_id,
    :recurrence
  ]

  @types [:income, :expense]

  def new(attrs) do
    with :ok <- validate_type(attrs[:type]),
         :ok <- validate_amount(attrs[:amount]),
         {:ok, recurrence} <- build_recurrence(attrs[:recurrence]) do
      transaction = struct!(__MODULE__, Map.put(attrs, :recurrence, recurrence))
      {:ok, transaction}
    end
  end

  def recurring?(%__MODULE__{recurrence: %Recurrence{frequency: :once}}), do: false
  def recurring?(%__MODULE__{recurrence: %Recurrence{}}), do: true

  def applies_to_month?(%__MODULE__{} = transaction, target_month) do
    cond do
      recurring?(transaction) ->
        Recurrence.should_generate_for_month?(
          transaction.recurrence,
          transaction.date,
          target_month
        )

      true ->
        transaction.date.year == target_month.year and
          transaction.date.month == target_month.month
    end
  end

  def effective_date_for_month(%__MODULE__{} = transaction, target_month) do
    if recurring?(transaction) do
      day = transaction.recurrence.day_of_month || transaction.date.day
      Date.new!(target_month.year, target_month.month, min(day, Date.days_in_month(target_month)))
    else
      transaction.date
    end
  end

  defp build_recurrence(nil), do: Recurrence.new(%{frequency: :once})
  defp build_recurrence(%Recurrence{} = recurrence), do: {:ok, recurrence}
  defp build_recurrence(attrs) when is_map(attrs), do: Recurrence.new(attrs)

  defp validate_type(type) when type in @types, do: :ok
  defp validate_type(_), do: {:error, :invalid_type}

  defp validate_amount(amount) when is_integer(amount) and amount > 0, do: :ok
  defp validate_amount(_), do: {:error, :amount_must_be_positive_integer}
end
