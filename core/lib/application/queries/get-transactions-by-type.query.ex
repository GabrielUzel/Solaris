defmodule SolarisCore.Finance.Application.Queries.GetTransactionsByType do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{TransactionSchema, CategorySchema, AccountSchema}

  def execute(type) when type in [:income, :expense] do
    query =
      from(transaction in TransactionSchema,
        join: category in CategorySchema,
        on: transaction.category_id == category.id,
        join: account in AccountSchema,
        on: transaction.account_id == account.id,
        where: transaction.type == ^type,
        select: %{
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description,
          category_name: category.name,
          account_name: account.name,
          recurrence_frequency: transaction.recurrence_frequency
        },
        order_by: [desc: transaction.date]
      )

    transactions = Repo.all(query)

    total =
      transactions
      |> Enum.map(& &1.amount)
      |> Enum.sum()

    {:ok,
     %{
       transactions: transactions,
       total: total,
       count: length(transactions)
     }}
  end
end
