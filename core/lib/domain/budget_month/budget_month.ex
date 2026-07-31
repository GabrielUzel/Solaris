defmodule SolarisCore.Finance.Domain.BudgetMonth do
  alias SolarisCore.Finance.Domain.BudgetMonth.Transaction

  @enforce_keys [:id, :reference_year, :reference_month, :starts_on, :ends_on]
  defstruct [
    :id,
    :reference_year,
    :reference_month,
    :starts_on,
    :ends_on,
    :initialized_at,
    transactions: []
  ]

  def new(attrs) do
    with :ok <- validate_reference_year(attrs[:reference_year]),
         :ok <- validate_reference_month(attrs[:reference_month]),
         :ok <- validate_starts_on(attrs[:starts_on]),
         :ok <- validate_ends_on(attrs[:ends_on]),
         :ok <- validate_starts_on_belongs_to_month(attrs[:starts_on], attrs[:reference_year], attrs[:reference_month]),
         :ok <- validate_ends_on_belongs_to_month(attrs[:ends_on], attrs[:reference_year], attrs[:reference_month]),
         :ok <- validate_date_order(attrs[:starts_on], attrs[:ends_on]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  def add_transaction(%__MODULE__{} = budget_month, %Transaction{} = transaction) do
    case check_duplicate_planned_transaction(budget_month, transaction) do
      :ok ->
        updated = %{budget_month | transactions: budget_month.transactions ++ [transaction]}
        {:ok, updated}

      error ->
        error
    end
  end

  def confirm_transaction(%__MODULE__{} = budget_month, transaction_id) do
    update_transaction_status(budget_month, transaction_id, :confirmed)
  end

  def skip_transaction(%__MODULE__{} = budget_month, transaction_id) do
    update_transaction_status(budget_month, transaction_id, :skipped)
  end

  def remove_manual_transaction(%__MODULE__{transactions: transactions} = budget_month, transaction_id) do
    case Enum.find(transactions, &(&1.id == transaction_id)) do
      nil ->
        {:error, :transaction_not_found}

      %Transaction{origin: :planned} ->
        {:error, :cannot_remove_planned_transaction}

      %Transaction{origin: :manual} ->
        updated = %{budget_month | transactions: Enum.reject(transactions, &(&1.id == transaction_id))}
        {:ok, updated}
    end
  end

  def unique_year_month?(%__MODULE__{reference_year: year, reference_month: month}, year, month),
    do: true

  def unique_year_month?(_, _, _), do: false

  defp update_transaction_status(%__MODULE__{transactions: transactions} = budget_month, transaction_id, new_status) do
    case Enum.find_index(transactions, &(&1.id == transaction_id)) do
      nil ->
        {:error, :transaction_not_found}

      index ->
        updated_transactions = List.update_at(transactions, index, &%{&1 | status: new_status})
        {:ok, %{budget_month | transactions: updated_transactions}}
    end
  end

  defp check_duplicate_planned_transaction(_budget_month, %Transaction{planned_transaction_id: nil}),
    do: :ok

  defp check_duplicate_planned_transaction(%__MODULE__{transactions: transactions}, %Transaction{
         planned_transaction_id: planned_id
       }) do
    duplicate? =
      Enum.any?(transactions, fn t -> t.planned_transaction_id == planned_id end)

    if duplicate?,
      do: {:error, :planned_transaction_already_materialized},
      else: :ok
  end

  defp validate_reference_year(year) when is_integer(year) and year > 0, do: :ok
  defp validate_reference_year(_), do: {:error, :invalid_reference_year}

  defp validate_reference_month(month) when is_integer(month) and month >= 1 and month <= 12,
    do: :ok

  defp validate_reference_month(_), do: {:error, :invalid_reference_month}

  defp validate_starts_on(%Date{}), do: :ok
  defp validate_starts_on(_), do: {:error, :starts_on_required}

  defp validate_ends_on(%Date{}), do: :ok
  defp validate_ends_on(_), do: {:error, :ends_on_required}

  defp validate_starts_on_belongs_to_month(%Date{} = date, year, month) do
    expected = Date.new!(year, month, 1)

    if Date.compare(date, expected) == :eq,
      do: :ok,
      else: {:error, :starts_on_must_be_first_day_of_reference_month}
  end

  defp validate_starts_on_belongs_to_month(_, _, _), do: :ok

  defp validate_ends_on_belongs_to_month(%Date{} = date, year, month) do
    expected = Date.end_of_month(Date.new!(year, month, 1))

    if Date.compare(date, expected) == :eq,
      do: :ok,
      else: {:error, :ends_on_must_be_last_day_of_reference_month}
  end

  defp validate_ends_on_belongs_to_month(_, _, _), do: :ok

  defp validate_date_order(%Date{} = starts_on, %Date{} = ends_on) do
    if Date.compare(starts_on, ends_on) != :gt,
      do: :ok,
      else: {:error, :starts_on_must_be_before_or_equal_to_ends_on}
  end

  defp validate_date_order(_, _), do: :ok
end
