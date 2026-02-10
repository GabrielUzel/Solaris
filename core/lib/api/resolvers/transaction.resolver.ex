defmodule SolarisCoreWeb.Api.Resolvers.TransactionResolver do
  alias SolarisCore.Finance.Application.{Commands, Queries}

  # ============================================================================
  # MUTATIONS
  # ============================================================================

  def create(_parent, %{input: input}, _resolution) do
    params = prepare_params(input)
    Commands.CreateTransaction.execute(params)
  end

  def update(_parent, %{id: id, input: input}, _resolution) do
    params = prepare_params(input)
    Commands.UpdateTransaction.execute(id, params)
  end

  def delete(_parent, %{id: id}, _resolution) do
    case Commands.DeleteTransaction.execute(id) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  # ============================================================================
  # QUERIES
  # ============================================================================

  def get_all(_parent, _args, _resolution) do
    Queries.GetAllTransactions.execute()
  end

  def get_by_account(_parent, %{account_id: account_id}, _resolution) do
    Queries.GetTransactionsByAccount.execute(account_id)
  end

  def get_by_category(_parent, %{category_id: category_id}, _resolution) do
    Queries.GetTransactionsByCategory.execute(category_id)
  end

  def get_by_description(_parent, %{description: description}, _resolution) do
    Queries.GetTransactionsByDescription.execute(description)
  end

  def get_by_type(_parent, %{type: type}, _resolution) do
    Queries.GetTransactionsByType.execute(type)
  end

  def get_by_date_range(
        _parent,
        %{account_id: account_id, start_date: start_date, end_date: end_date},
        _resolution
      ) do
    with {:ok, start_d} <- Date.from_iso8601(start_date),
         {:ok, end_d} <- Date.from_iso8601(end_date) do
      Queries.GetTransactionsByDateRange.execute(account_id, start_d, end_d)
    else
      {:error, _} -> {:error, "Invalid date format. Use ISO8601 (YYYY-MM-DD)"}
    end
  end

  def get_by_recurrence(_parent, %{frequency: frequency}, _resolution) do
    Queries.GetTransactionsByRecurrence.execute(frequency)
  end

  def get_for_month(_parent, %{account_id: account_id, year: year, month: month}, _resolution) do
    Queries.GetTransactionsForMonth.execute(account_id, year, month)
  end

  def get_month_summary(_parent, %{account_id: account_id, year: year, month: month}, _resolution) do
    Queries.GetMonthSummary.execute(account_id, year, month)
  end

  # ============================================================================
  # PRIVATE HELPERS
  # ============================================================================

  defp prepare_params(input) do
    input
    |> maybe_parse_date()
    |> maybe_parse_recurrence_date()
  end

  defp maybe_parse_date(%{date: date_string} = params) when is_binary(date_string) do
    case Date.from_iso8601(date_string) do
      {:ok, date} -> Map.put(params, :date, date)
      _ -> params
    end
  end

  defp maybe_parse_date(params), do: params

  defp maybe_parse_recurrence_date(%{recurrence: %{end_date: date_string}} = params)
       when is_binary(date_string) do
    case Date.from_iso8601(date_string) do
      {:ok, date} -> put_in(params, [:recurrence, :end_date], date)
      _ -> params
    end
  end

  defp maybe_parse_recurrence_date(params), do: params
end
