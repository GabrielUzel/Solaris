defmodule SolarisCore.Finance.Domain.Recurrence do
  @enforce_keys [:frequency]
  defstruct [:frequency, :interval, :day_of_month, :end_date]

  @frequencies [:once, :daily, :weekly, :monthly, :quarterly, :yearly]

  def new(attrs) do
    with :ok <- validate_frequency(attrs[:frequency]) do
      {:ok, struct!(__MODULE__, Map.merge(default_attrs(), attrs))}
    end
  end

  def should_generate_for_month?(%__MODULE__{} = recurrence, start_date, target_month) do
    if Date.compare(target_month, %{start_date | day: 1}) == :lt do
      false
    else
      case recurrence.frequency do
        :once ->
          start_date.year == target_month.year and
          start_date.month == target_month.month

        :monthly -> true

        :quarterly ->
          months_diff = months_between(start_date, target_month)
          rem(months_diff, 3) == 0

        :yearly ->
          start_date.month == target_month.month

        _ -> false
      end
    end
  end

  defp validate_frequency(frequency) when frequency in @frequencies, do: :ok
  defp validate_frequency(_), do: {:error, :invalid_frequency}

  defp default_attrs, do: %{interval: 1}

  defp months_between(start_date, end_date) do
    (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
  end
end
