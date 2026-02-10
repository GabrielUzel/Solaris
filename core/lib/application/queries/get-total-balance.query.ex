defmodule SolarisCore.Finance.Application.Queries.GetTotalBalance do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{AccountSchema, TransactionSchema}

  def execute do
    balance_query =
      from(transaction in TransactionSchema,
        join: account in AccountSchema,
        on: transaction.account_id == account.id,
        where: transaction.recurrence_frequency == :once,
        group_by: [account.id, account.name, account.type],
        select: %{
          account_id: account.id,
          account_name: account.name,
          account_type: account.type,
          total_income:
            sum(
              fragment(
                "CASE WHEN ? = 'income' THEN ? ELSE 0 END",
                transaction.type,
                transaction.amount
              )
            ),
          total_expense:
            sum(
              fragment(
                "CASE WHEN ? = 'expense' THEN ? ELSE 0 END",
                transaction.type,
                transaction.amount
              )
            )
        }
      )

    accounts_data = Repo.all(balance_query)

    accounts_with_balance =
      Enum.map(accounts_data, fn acc ->
        income = acc.total_income || 0
        expense = acc.total_expense || 0
        balance = income - expense

        %{
          id: acc.account_id,
          name: acc.account_name,
          type: acc.account_type,
          balance: balance,
          total_income: income,
          total_expense: expense
        }
      end)

    all_accounts = Repo.all(AccountSchema)
    accounts_ids_with_transactions = Enum.map(accounts_with_balance, & &1.id)

    accounts_without_transactions =
      all_accounts
      |> Enum.reject(&(&1.id in accounts_ids_with_transactions))
      |> Enum.map(fn acc ->
        %{
          id: acc.id,
          name: acc.name,
          type: acc.type,
          balance: 0,
          total_income: 0,
          total_expense: 0
        }
      end)

    all_accounts_complete = accounts_with_balance ++ accounts_without_transactions

    total_balance =
      all_accounts_complete
      |> Enum.map(& &1.balance)
      |> Enum.sum()

    {:ok,
     %{
       total_balance: total_balance,
       accounts: Enum.sort_by(all_accounts_complete, & &1.name),
       accounts_count: length(all_accounts_complete)
     }}
  end
end
