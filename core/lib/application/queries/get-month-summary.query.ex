defmodule SolarisCore.Finance.Application.Queries.GetMonthSummary do
  alias SolarisCore.Finance.Application.Queries.GetTransactionsForMonth

  def execute(account_id, year, month) do
    {:ok, transactions} = GetTransactionsForMonth.execute(account_id, year, month)

    income = calculate_total(transactions, :income)
    expense = calculate_total(transactions, :expense)
    balance = income - expense

    {:ok,
     %{
       period: %{year: year, month: month},
       total_income: income,
       total_expense: expense,
       balance: balance,
       transactions_count: length(transactions),
       by_category: group_by_category(transactions)
     }}
  end

  defp calculate_total(transactions, type) do
    transactions
    |> Enum.filter(&(&1.type == type))
    |> Enum.map(& &1.amount)
    |> Enum.sum()
  end

  defp group_by_category(transactions) do
    transactions
    |> Enum.group_by(& &1.category_name)
    |> Enum.map(fn {category, trans} ->
      total =
        trans
        |> Enum.map(& &1.amount)
        |> Enum.sum()

      %{
        category: category,
        total: total,
        count: length(trans),
        color: List.first(trans).category_color
      }
    end)
    |> Enum.sort_by(& &1.total, :desc)
  end
end
