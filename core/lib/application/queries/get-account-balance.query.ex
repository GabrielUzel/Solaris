defmodule SolarisCore.Finance.Application.Queries.GetAccountBalance do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{AccountSchema, TransactionSchema}

  def execute(account_id) do
    account_query =
      from(account in AccountSchema,
        where: account.id == ^account_id,
        select: %{
          id: account.id,
          name: account.name,
          type: account.type,
          inserted_at: account.inserted_at
        }
      )

    account = Repo.one(account_query)

    if account do
      balance_query =
        from(transaction in TransactionSchema,
          where: transaction.account_id == ^account_id,
          where: transaction.recurrence_frequency == :once,
          select: %{
            type: transaction.type,
            amount: transaction.amount
          }
        )

      transactions = Repo.all(balance_query)

      balance =
        Enum.reduce(transactions, 0, fn t, acc ->
          case t.type do
            :income -> acc + t.amount
            :expense -> acc - t.amount
          end
        end)

      {:ok, Map.put(account, :balance, balance)}
    else
      {:error, :not_found}
    end
  end
end
