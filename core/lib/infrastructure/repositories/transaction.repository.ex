defmodule SolarisCore.Infrastructure.Repositories.TransactionRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema

  def create(attrs) do
    %TransactionSchema{}
    |> TransactionSchema.changeset(attrs)
    |> Repo.insert()
  end

  def list_all do
    Repo.all(TransactionSchema)
  end
end
