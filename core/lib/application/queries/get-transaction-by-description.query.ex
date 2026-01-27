defmodule SolarisCore.Finance.Application.Queries.GetTransactionsByDescription do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{TransactionSchema, CategorySchema, AccountSchema}

  @doc """
  Busca transações por descrição (busca parcial, case-insensitive).
  Inclui informações de categoria e conta.
  """
  def execute(description) do
    query =
      from(transaction in TransactionSchema,
        join: category in CategorySchema,
        on: transaction.category_id == category.id,
        join: account in AccountSchema,
        on: transaction.account_id == account.id,
        where: ilike(transaction.description, ^"%#{description}%"),
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
    {:ok, transactions}
  end
end
