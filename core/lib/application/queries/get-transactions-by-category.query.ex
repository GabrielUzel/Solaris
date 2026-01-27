defmodule SolarisCore.Finance.Application.Queries.GetTransactionsByCategory do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{TransactionSchema, AccountSchema, CategorySchema}

  def execute(category_id) do
    category_query =
      from(category in CategorySchema,
        where: category.id == ^category_id,
        select: %{
          id: category.id,
          name: category.name,
          type: category.type,
          color: category.color
        }
      )

    category = Repo.one(category_query)

    if category do
      query =
        from(transaction in TransactionSchema,
          join: account in AccountSchema,
          on: transaction.account_id == account.id,
          where: transaction.category_id == ^category_id,
          select: %{
            id: transaction.id,
            amount: transaction.amount,
            type: transaction.type,
            date: transaction.date,
            description: transaction.description,
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
         category: category,
         transactions: transactions,
         total: total,
         count: length(transactions)
       }}
    else
      {:error, :category_not_found}
    end
  end
end
