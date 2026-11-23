defmodule SolarisCore.Finance.Domain.CreditCard.Invoice do
  alias SolarisCore.Finance.Domain.CreditCard
  alias SolarisCore.Finance.Domain.CreditCard.InvoiceEntry

  defstruct [
    :credit_card_id,
    :period_start,
    :period_end,
    :closing_date,
    :due_date,
    :total,
    :paid_total,
    :open_total,
    entries: [],
    status: :empty
  ]

  def closing_date_for(%Date{} = occurred_on, closing_day) do
    if occurred_on.day <= closing_day do
      Date.new!(occurred_on.year, occurred_on.month, closing_day)
    else
      next_month = next_month_start(occurred_on)
      Date.new!(next_month.year, next_month.month, closing_day)
    end
  end

  def period(%Date{} = closing_date, closing_day) do
    previous_month = closing_date |> Date.beginning_of_month() |> Date.add(-1)
    previous_closing = Date.new!(previous_month.year, previous_month.month, closing_day)

    {Date.add(previous_closing, 1), closing_date}
  end

  def due_date_for(%Date{} = closing_date, due_day) do
    next_month = next_month_start(closing_date)
    Date.new!(next_month.year, next_month.month, due_day)
  end

  def build(%CreditCard{} = card, rows) do
    rows
    |> Enum.group_by(&closing_date_for(&1.occurred_on, card.closing_day))
    |> Enum.map(fn {closing_date, group_rows} ->
      build_invoice(card, closing_date, group_rows)
    end)
    |> Enum.sort_by(& &1.due_date, Date)
  end

  def current(invoices) do
    invoices
    |> Enum.filter(&(&1.status == :open))
    |> Enum.sort_by(& &1.due_date, Date)
    |> List.first()
  end

  def future(_invoices, nil), do: []

  def future(invoices, %__MODULE__{due_date: current_due_date}) do
    invoices
    |> Enum.filter(&(Date.compare(&1.due_date, current_due_date) == :gt))
    |> Enum.sort_by(& &1.due_date, Date)
  end

  def overdue?(%__MODULE__{status: :open, due_date: due_date}, %Date{} = today) do
    Date.compare(due_date, today) == :lt
  end

  def overdue?(%__MODULE__{}, %Date{}), do: false

  defp build_invoice(%CreditCard{} = card, closing_date, rows) do
    {period_start, period_end} = period(closing_date, card.closing_day)
    entries = Enum.map(rows, &to_entry/1)
    total = sum_amounts(entries)
    paid_total = entries |> Enum.filter(&(&1.status == :paid)) |> sum_amounts()

    %__MODULE__{
      credit_card_id: card.id,
      period_start: period_start,
      period_end: period_end,
      closing_date: closing_date,
      due_date: due_date_for(closing_date, card.due_day),
      total: total,
      paid_total: paid_total,
      open_total: total - paid_total,
      entries: entries,
      status: if(Enum.all?(entries, &(&1.status == :paid)), do: :closed, else: :open)
    }
  end

  defp to_entry(row) do
    %InvoiceEntry{
      transaction_id: row.id,
      budget_month_id: row.budget_month_id,
      description: row.description,
      category_id: row.category_id,
      category_name: row.category_name,
      category_color: row.category_color,
      amount: entry_amount(row),
      expected_amount: row.expected_amount,
      actual_amount: row.actual_amount,
      status: row.status,
      occurred_on: row.occurred_on,
      installment_number: row.installment_number,
      installments_total: row.installments_total,
      installment_group_id: row.installment_group_id,
      notes: row.notes
    }
  end

  defp entry_amount(%{status: :paid, actual_amount: actual_amount}), do: actual_amount
  defp entry_amount(%{expected_amount: expected_amount}), do: expected_amount

  defp sum_amounts(entries), do: Enum.reduce(entries, 0, &(&1.amount + &2))

  defp next_month_start(%Date{} = date) do
    date
    |> Date.beginning_of_month()
    |> Date.add(32)
    |> Date.beginning_of_month()
  end
end
