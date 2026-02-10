defmodule SolarisCore.Finance.Application.Queries.GetAllAccounts do
  import Ecto.Query
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.AccountSchema

  def execute do
    query =
      from(account in AccountSchema,
        select: %{
          id: account.id,
          name: account.name,
          type: account.type,
          inserted_at: account.inserted_at
        },
        order_by: [asc: account.name]
      )

    accounts = Repo.all(query)
    {:ok, accounts}
  end
end
