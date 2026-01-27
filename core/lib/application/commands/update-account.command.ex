defmodule SolarisCore.Finance.Application.Commands.UpdateAccount do
  alias SolarisCore.Finance.Domain.Account
  alias SolarisCore.Infrastructure.Repositories.AccountRepo

  @type params :: %{
          optional(:name) => String.t(),
          optional(:type) => atom()
        }

  @type result :: {:ok, Account.t()} | {:error, term()}

  @spec execute(String.t(), params()) :: result()
  def execute(id, params) do
    with {:ok, account} <- AccountRepo.get(id),
         account_map <- Map.from_struct(account),
         {:ok, updated_account} <- Account.new(Map.merge(account_map, params)),
         {:ok, persisted} <- AccountRepo.update(updated_account) do
      {:ok, persisted}
    end
  end
end
