defmodule SolarisCore.Finance.Application.Queries.GetTransactionsByDateRange do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{TransactionSchema, CategorySchema, AccountSchema}

  def execute(account_id, start_date, end_date) do
    query =
      from(transaction in TransactionSchema,
        join: category in CategorySchema,
        on: transaction.category_id == category.id,
        join: account in AccountSchema,
        on: transaction.account_id == account.id,
        where: transaction.account_id == ^account_id,
        where: transaction.date >= ^start_date and transaction.date <= ^end_date,
        select: %{
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description,
          category_name: category.name,
          category_color: category.color,
          account_name: account.name,
          recurrence_frequency: transaction.recurrence_frequency
        },
        order_by: [desc: transaction.date]
      )

    transactions = Repo.all(query)

    income = calculate_total(transactions, :income)
    expense = calculate_total(transactions, :expense)

    {:ok,
     %{
       transactions: transactions,
       period: %{start: start_date, end: end_date},
       total_income: income,
       total_expense: expense,
       balance: income - expense,
       count: length(transactions)
     }}
  end

  defp calculate_total(transactions, type) do
    transactions
    |> Enum.filter(&(&1.type == type))
    |> Enum.map(& &1.amount)
    |> Enum.sum()
  end
end
