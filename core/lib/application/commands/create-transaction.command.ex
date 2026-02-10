defmodule SolarisCore.Finance.Application.Commands.CreateTransaction do
  alias SolarisCore.Finance.Domain.Transaction
  alias SolarisCore.Infrastructure.Repositories.TransactionRepo

  @type recurrence_params :: %{
          required(:frequency) => atom(),
          optional(:interval) => integer(),
          optional(:day_of_month) => integer(),
          optional(:end_date) => Date.t()
        }

  @type params :: %{
          required(:account_id) => String.t(),
          required(:amount) => integer(),
          required(:type) => :income | :expense,
          required(:date) => Date.t(),
          required(:description) => String.t(),
          required(:category_id) => String.t(),
          optional(:recurrence) => recurrence_params()
        }

  @type result :: {:ok, Transaction.t()} | {:error, term()}

  @spec execute(params()) :: result()
  def execute(params) do
    with {:ok, transaction} <- Transaction.new(params),
         {:ok, persisted} <- TransactionRepo.create(transaction) do
      {:ok, persisted}
    end
  end
end
