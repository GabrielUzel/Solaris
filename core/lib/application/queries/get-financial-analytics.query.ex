defmodule SolarisCore.Application.Queries.GetFinancialAnalytics do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.BudgetMonthSchema
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema

  @category_limit 8
  @month_labels ~w(Jan Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez)

  @spec execute(Date.t(), Date.t()) :: {:ok, map()}
  def execute(start_date, end_date) do
    transactions = fetch_eligible_transactions(start_date, end_date)

    {:ok,
     %{
       period: build_period(start_date, end_date, transactions),
       expenses_by_category: build_expenses_by_category(transactions),
       monthly_income_expense_trend: build_monthly_trend(transactions),
       expenses_by_payment_method: build_expenses_by_payment_method(transactions),
       totals: build_totals(transactions)
     }}
  end

  defp fetch_eligible_transactions(start_date, end_date) do
    from(t in TransactionSchema,
      join: bm in BudgetMonthSchema,
      on: bm.id == t.budget_month_id,
      left_join: c in CategorySchema,
      on: c.id == t.category_id,
      where: t.occurred_on >= ^start_date and t.occurred_on <= ^end_date,
      where: t.status != :skipped,
      select: %{
        id: t.id,
        type: t.type,
        expected_amount: t.expected_amount,
        actual_amount: t.actual_amount,
        payment_method: t.payment_method,
        occurred_on: t.occurred_on,
        status: t.status,
        budget_month_id: t.budget_month_id,
        reference_year: bm.reference_year,
        reference_month: bm.reference_month,
        category_id: t.category_id,
        category_name: c.name,
        category_color: c.color
      }
    )
    |> Repo.all()
  end

  defp build_period(start_date, end_date, transactions) do
    case transactions do
      [] ->
        %{
          start_date: start_date,
          end_date: end_date,
          month_count: max(months_between(start_date, end_date), 0)
        }

      _ ->
        occurred_dates = Enum.map(transactions, & &1.occurred_on)
        min_date = Enum.min(occurred_dates)
        max_date = Enum.max(occurred_dates)

        %{
          start_date: min_date,
          end_date: max_date,
          month_count: max(months_between(min_date, max_date), 0)
        }
    end
  end

  defp build_expenses_by_category(transactions) do
    expenses = Enum.filter(transactions, &(&1.type == :expense))
    total_expenses = Enum.sum(Enum.map(expenses, &effective_amount(&1)))

    slices =
      expenses
      |> Enum.group_by(& &1.category_id)
      |> Enum.map(fn {category_id, items} ->
        total = Enum.sum(Enum.map(items, &effective_amount(&1)))

        %{
          category_id: category_id || "sem-categoria",
          category_name: hd(items).category_name || "Sem categoria",
          category_color: hd(items).category_color,
          total_amount: total,
          transaction_count: length(items),
          percentage: percentage(total, total_expenses)
        }
      end)
      |> Enum.sort_by(& &1.total_amount, :desc)

    top = Enum.take(slices, @category_limit)

    case Enum.drop(slices, @category_limit) do
      [] ->
        top

      rest ->
        rest_total = Enum.sum(Enum.map(rest, & &1.total_amount))
        rest_count = Enum.sum(Enum.map(rest, & &1.transaction_count))

        top ++
          [
            %{
              category_id: "outros",
              category_name: "Outros",
              category_color: nil,
              total_amount: rest_total,
              transaction_count: rest_count,
              percentage: percentage(rest_total, total_expenses)
            }
          ]
    end
  end

  defp build_monthly_trend(transactions) do
    transactions
    |> Enum.group_by(&{&1.reference_year, &1.reference_month})
    |> Enum.map(fn {{year, month}, items} ->
      income_total = Enum.sum(Enum.map(items, &type_total(&1, :income)))
      expense_total = Enum.sum(Enum.map(items, &type_total(&1, :expense)))

      %{
        year: year,
        month: month,
        label: month_label(month, year),
        income_total: income_total,
        expense_total: expense_total,
        balance: income_total - expense_total
      }
    end)
    |> Enum.sort_by(&{&1.year, &1.month})
  end

  defp build_expenses_by_payment_method(transactions) do
    expenses = Enum.filter(transactions, &(&1.type == :expense))
    total_expenses = Enum.sum(Enum.map(expenses, &effective_amount(&1)))

    expenses
    |> Enum.group_by(& &1.payment_method)
    |> Enum.map(fn {method, items} ->
      total = Enum.sum(Enum.map(items, &effective_amount(&1)))

      %{
        payment_method: method,
        total_amount: total,
        transaction_count: length(items),
        percentage: percentage(total, total_expenses)
      }
    end)
    |> Enum.sort_by(& &1.total_amount, :desc)
  end

  defp build_totals(transactions) do
    income_total = Enum.sum(Enum.map(transactions, &type_total(&1, :income)))
    expense_total = Enum.sum(Enum.map(transactions, &type_total(&1, :expense)))

    %{
      income_total: income_total,
      expense_total: expense_total,
      balance: income_total - expense_total,
      transaction_count: length(transactions)
    }
  end

  defp effective_amount(transaction) do
    if transaction.status == :paid do
      transaction.actual_amount || transaction.expected_amount
    else
      transaction.expected_amount
    end
  end

  defp type_total(transaction, type) do
    if transaction.type == type, do: effective_amount(transaction), else: 0
  end

  defp percentage(_part, 0), do: 0.0

  defp percentage(part, total) do
    Float.round(part / total * 100, 1)
  end

  defp month_label(month, year) do
    short_year = year |> rem(100) |> Integer.to_string() |> String.pad_leading(2, "0")
    "#{Enum.at(@month_labels, month - 1)}/#{short_year}"
  end

  defp months_between(start_date, end_date) do
    (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
  end
end
