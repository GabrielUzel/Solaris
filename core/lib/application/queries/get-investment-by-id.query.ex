defmodule SolarisCore.Application.Queries.GetInvestmentById do
  alias SolarisCore.Finance.Domain.Investment
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo

  @spec execute(String.t()) :: {:ok, Investment.t()} | {:error, :not_found}
  def execute(id) do
    InvestmentRepo.get(id)
  end
end
