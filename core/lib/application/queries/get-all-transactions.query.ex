defmodule SolarisCore.Finance.Application.Queries.GetAllTransactions do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{TransactionSchema, CategorySchema, AccountSchema}

  def execute do
    query =
      from(transaction in TransactionSchema,
        join: category in CategorySchema,
        on: transaction.category_id == category.id,
        join: account in AccountSchema,
        on: transaction.account_id == account.id,
        select: %{
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description,
          category: %{
            id: category.id,
            name: category.name,
            color: category.color
          },
          account: %{
            id: account.id,
            name: account.name
          },
          recurrence: %{
            frequency: transaction.recurrence_frequency,
            interval: transaction.recurrence_interval,
            day_of_month: transaction.recurrence_day_of_month,
            end_date: transaction.recurrence_end_date
          },
          is_recurring: transaction.recurrence_frequency != :once
        },
        order_by: [desc: transaction.date]
      )

    transactions = Repo.all(query)
    {:ok, transactions}
  end
end
