defmodule SolarisCore.Finance.Application.Commands.CreateAccount do
  alias SolarisCore.Finance.Domain.Account
  alias SolarisCore.Infrastructure.Repositories.AccountRepo

  @type params :: %{
          required(:name) => String.t(),
          required(:type) => atom()
        }

  @type result :: {:ok, Account.t()} | {:error, term()}

  @spec execute(params()) :: result()
  def execute(params) do
    with {:ok, account} <- Account.new(params),
         {:ok, persisted_account} <- AccountRepo.create(account) do
      {:ok, persisted_account}
    end
  end
end
