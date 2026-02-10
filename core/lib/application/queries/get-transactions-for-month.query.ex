defmodule SolarisCore.Finance.Application.Queries.GetTransactionsForMonth do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.{TransactionSchema, CategorySchema}
  alias SolarisCore.Finance.Domain.{Transaction, Recurrence}

  def execute(account_id, year, month) do
    target_date = Date.new!(year, month, 1)

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
          recurrence_interval: transaction.recurrence_interval,
          recurrence_day_of_month: transaction.recurrence_day_of_month,
          recurrence_end_date: transaction.recurrence_end_date
        }
      )

    transactions = Repo.all(query)

    projected_transactions =
      transactions
      |> Enum.map(&to_domain/1)
      |> Enum.filter(&applies_to_month?(&1, target_date))
      |> Enum.map(&project_to_month(&1, target_date))
      |> Enum.sort_by(& &1.date, Date)

    {:ok, projected_transactions}
  end

  defp to_domain(schema_map) do
    {:ok, recurrence} =
      Recurrence.new(%{
        frequency: schema_map.recurrence_frequency,
        interval: schema_map.recurrence_interval,
        day_of_month: schema_map.recurrence_day_of_month,
        end_date: schema_map.recurrence_end_date
      })

    {:ok, transaction} =
      Transaction.new(%{
        id: schema_map.id,
        account_id: nil,
        amount: schema_map.amount,
        type: schema_map.type,
        date: schema_map.date,
        description: schema_map.description,
        category_id: nil,
        recurrence: recurrence
      })

    Map.merge(transaction, %{
      category_name: schema_map.category_name,
      category_color: schema_map.category_color
    })
  end

  defp applies_to_month?(transaction, target_date) do
    Transaction.applies_to_month?(transaction, target_date)
  end

  defp project_to_month(transaction, target_date) do
    if Transaction.recurring?(transaction) do
      effective_date = Transaction.effective_date_for_month(transaction, target_date)
      Map.put(transaction, :date, effective_date)
    else
      transaction
    end
  end
end
