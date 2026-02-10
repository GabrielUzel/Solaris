defmodule SolarisCoreWeb.Api.Resolvers.AccountResolver do
  alias SolarisCore.Finance.Application.{Commands, Queries}

  # ============================================================================
  # MUTATIONS
  # ============================================================================

  def create(_parent, %{input: input}, _resolution) do
    Commands.CreateAccount.execute(input)
  end

  def update(_parent, %{id: id, input: input}, _resolution) do
    Commands.UpdateAccount.execute(id, input)
  end

  def delete(_parent, %{id: id}, _resolution) do
    case Commands.DeleteAccount.execute(id) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  # ============================================================================
  # QUERIES
  # ============================================================================

  def get_all(_parent, _args, _resolution) do
    Queries.GetAllAccounts.execute()
  end

  def get_balance(_parent, %{id: id}, _resolution) do
    Queries.GetAccountBalance.execute(id)
  end

  def get_total_balance(_parent, _args, _resolution) do
    Queries.GetTotalBalance.execute()
  end
end
