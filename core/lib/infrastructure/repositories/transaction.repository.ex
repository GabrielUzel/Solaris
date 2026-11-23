defmodule SolarisCore.Infrastructure.Repositories.TransactionRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema
  import Ecto.Query

  def insert_many(transactions) do
    transactions
    |> Enum.reduce(Ecto.Multi.new(), fn attrs, acc ->
      Ecto.Multi.insert(
        acc,
        {:transaction, attrs.id},
        TransactionSchema.changeset(%TransactionSchema{}, attrs)
      )
    end)
    |> Repo.transaction()
    |> case do
      {:ok, _changes} -> {:ok, :inserted}
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end

  def claim_scheduled(budget_month_id, %Date{} = starts_on, %Date{} = ends_on) do
    {count, _} =
      TransactionSchema
      |> where(
        [t],
        is_nil(t.budget_month_id) and t.occurred_on >= ^starts_on and t.occurred_on <= ^ends_on
      )
      |> Repo.update_all(set: [budget_month_id: budget_month_id])

    count
  end

  def update_installment_group_card(group_id, credit_card_id) do
    {count, _} =
      TransactionSchema
      |> where([t], t.installment_group_id == ^group_id)
      |> Repo.update_all(set: [credit_card_id: credit_card_id])

    count
  end
end
