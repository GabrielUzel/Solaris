defmodule SolarisCore.Finance.Application.Queries.GetTransactionsByRecurrence do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{TransactionSchema, CategorySchema, AccountSchema}

  def execute(frequency)
      when frequency in [:once, :daily, :weekly, :monthly, :quarterly, :yearly] do
    query =
      from(transaction in TransactionSchema,
        join: category in CategorySchema,
        on: transaction.category_id == category.id,
        join: account in AccountSchema,
        on: transaction.account_id == account.id,
        where: transaction.recurrence_frequency == ^frequency,
        select: %{
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description,
          category_name: category.name,
          account_name: account.name,
          recurrence: %{
            frequency: transaction.recurrence_frequency,
            interval: transaction.recurrence_interval,
            day_of_month: transaction.recurrence_day_of_month,
            end_date: transaction.recurrence_end_date
          }
        },
        order_by: [desc: transaction.date]
      )

    transactions = Repo.all(query)

    {:ok,
     %{
       frequency: frequency,
       transactions: transactions,
       count: length(transactions)
     }}
  end
end
