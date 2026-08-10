defmodule SolarisCore.Application.Queries.GetPlannedTransactionById do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Infrastructure.Schemas.PlannedTransactionSchema

  @spec execute(String.t()) :: {:ok, map()} | {:error, :not_found}
  def execute(id) do
    query =
      from(pt in PlannedTransactionSchema,
        left_join: c in CategorySchema,
        on: c.id == pt.category_id,
        where: pt.id == ^id,
        select: %{
          id: pt.id,
          description: pt.description,
          amount: pt.amount,
          type: pt.type,
          category_id: pt.category_id,
          category_name: c.name,
          category_color: c.color,
          category_type: c.type,
          payment_method: pt.payment_method,
          day_of_month: pt.day_of_month,
          starts_on: pt.starts_on,
          active: pt.active,
          notes: pt.notes
        }
      )

    case Repo.one(query) do
      nil -> {:error, :not_found}
      planned -> {:ok, planned}
    end
  end
end
