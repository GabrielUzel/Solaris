defmodule SolarisCore.Finance.Application.Commands.UpdateTransaction do
  alias SolarisCore.Finance.Domain.Transaction
  alias SolarisCore.Infrastructure.Repositories.TransactionRepo

  @type recurrence_params :: %{
          required(:frequency) => atom(),
          optional(:interval) => integer(),
          optional(:day_of_month) => integer(),
          optional(:end_date) => Date.t()
        }

  @type params :: %{
          optional(:account_id) => String.t(),
          optional(:amount) => integer(),
          optional(:type) => :income | :expense,
          optional(:date) => Date.t(),
          optional(:description) => String.t(),
          optional(:category_id) => String.t(),
          optional(:recurrence) => recurrence_params()
        }

  @type result :: {:ok, Transaction.t()} | {:error, term()}

  @spec execute(String.t(), params()) :: result()
  def execute(id, params) do
    with {:ok, transaction} <- TransactionRepo.get(id),
         transaction_map <- Map.from_struct(transaction),
         recurrence_map <- Map.from_struct(transaction.recurrence),
         merged_params <- merge_params(transaction_map, recurrence_map, params),
         {:ok, updated_transaction} <- Transaction.new(merged_params),
         {:ok, persisted} <- TransactionRepo.update(updated_transaction) do
      {:ok, persisted}
    end
  end

  defp merge_params(transaction_map, recurrence_map, params) do
    base_params = Map.merge(transaction_map, params)

    if Map.has_key?(params, :recurrence) do
      updated_recurrence = Map.merge(recurrence_map, params.recurrence)
      Map.put(base_params, :recurrence, updated_recurrence)
    else
      Map.put(base_params, :recurrence, recurrence_map)
    end
  end
end
