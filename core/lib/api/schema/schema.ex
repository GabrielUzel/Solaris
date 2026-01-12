defmodule SolarisCoreWeb.Schema do
  use Absinthe.Schema

  import_types(SolarisCoreWeb.Schema.Types.TransactionTypes)

  query do
    field :health_check, :string do
      resolve(fn _, _, _ -> {:ok, "Solaris Core is running"} end)
    end

    field :transactions, list_of(:transaction) do
      resolve(fn _, _, _ ->
        {:ok, SolarisCore.Infrastructure.Repositories.TransactionRepo.list_all()}
      end)
    end
  end
end
