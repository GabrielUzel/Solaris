defmodule SolarisCore.Application.Queries.ListActivePlannedTransactions do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Infrastructure.Schemas.PlannedTransactionSchema

  @spec execute() :: {:ok, [map()]}
  def execute do
    planned =
      Repo.all(
        from(pt in PlannedTransactionSchema,
          left_join: c in CategorySchema,
          on: c.id == pt.category_id,
          where: pt.active == true,
          order_by: [asc: pt.starts_on, asc: pt.day_of_month],
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
      )

    {:ok, planned}
  end
end
