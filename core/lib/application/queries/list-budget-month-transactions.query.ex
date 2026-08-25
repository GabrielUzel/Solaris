defmodule SolarisCore.Application.Queries.ListBudgetMonthTransactions do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.BudgetMonthSchema
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema

  @spec execute(String.t(), map()) :: {:ok, [map()]} | {:error, :not_found}
  def execute(budget_month_id, filters \\ %{}) do
    budget_month_exists? =
      Repo.exists?(from(bm in BudgetMonthSchema, where: bm.id == ^budget_month_id))

    if not budget_month_exists? do
      {:error, :not_found}
    else
      query =
        from(t in TransactionSchema,
          left_join: c in CategorySchema,
          on: c.id == t.category_id,
          where: t.budget_month_id == ^budget_month_id,
          select: %{
            id: t.id,
            planned_transaction_id: t.planned_transaction_id,
            description: t.description,
            expected_amount: t.expected_amount,
            actual_amount: t.actual_amount,
            type: t.type,
            category_id: t.category_id,
            category_name: c.name,
            category_color: c.color,
            category_type: c.type,
            payment_method: t.payment_method,
            occurred_on: t.occurred_on,
            origin: t.origin,
            status: t.status,
            notes: t.notes,
            created_at: t.inserted_at,
            updated_at: t.updated_at
          }
        )

      query =
        query
        |> maybe_filter_category_id(filters)
        |> maybe_filter_name(filters)
        |> maybe_filter_origin(filters)
        |> maybe_filter_category_type(filters)
        |> maybe_filter_start_date(filters)
        |> maybe_filter_end_date(filters)

      {:ok, Repo.all(query)}
    end
  end

  defp maybe_filter_category_id(query, %{category_id: category_id})
       when not is_nil(category_id) do
    from(q in query, where: q.category_id == ^category_id)
  end

  defp maybe_filter_category_id(query, _), do: query

  defp maybe_filter_name(query, %{name: name}) when is_binary(name) and byte_size(name) > 0 do
    pattern = "%" <> name <> "%"
    from(q in query, where: like(q.description, ^pattern))
  end

  defp maybe_filter_name(query, _), do: query

  defp maybe_filter_origin(query, %{origin: origin}) when origin in [:manual, :planned] do
    from(q in query, where: q.origin == ^origin)
  end

  defp maybe_filter_origin(query, _), do: query

  defp maybe_filter_category_type(query, %{category_type: category_type})
       when category_type in [:income, :expense] do
    from([_t, c] in query, where: c.type == ^category_type)
  end

  defp maybe_filter_category_type(query, _), do: query

  defp maybe_filter_start_date(query, %{start_date: %Date{} = start_date}) do
    from(q in query, where: q.occurred_on >= ^start_date)
  end

  defp maybe_filter_start_date(query, _), do: query

  defp maybe_filter_end_date(query, %{end_date: %Date{} = end_date}) do
    from(q in query, where: q.occurred_on <= ^end_date)
  end

  defp maybe_filter_end_date(query, _), do: query
end
