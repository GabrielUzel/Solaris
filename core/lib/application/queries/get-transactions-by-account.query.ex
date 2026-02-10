defmodule SolarisCore.Finance.Application.Queries.GetTransactionsByAccount do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{TransactionSchema, CategorySchema}

  def execute(account_id) do
    query =
      from(transaction in TransactionSchema,
        join: category in CategorySchema,
        on: transaction.category_id == category.id,
        where: transaction.account_id == ^account_id,
        select: %{
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description,
          category_name: category.name,
          category_color: category.color,
          recurrence_frequency: transaction.recurrence_frequency,
          is_recurring: transaction.recurrence_frequency != :once
        },
        order_by: [desc: transaction.date]
      )

    transactions = Repo.all(query)
    {:ok, transactions}
  end
end
