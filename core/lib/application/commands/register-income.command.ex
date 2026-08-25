defmodule SolarisCore.Application.Commands.RegisterIncome do
  alias Ecto.UUID
  alias SolarisCore.Finance.Domain.DividendIncome
  alias SolarisCore.Infrastructure.Repositories.DividendIncomeRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo

  @spec execute(map()) :: {:ok, DividendIncome.t()} | {:error, term()}
  def execute(attrs) do
    with {:ok, investment} <- InvestmentRepo.get(attrs[:investment_id]),
         {:ok, income} <- build_income(investment, attrs),
         {:ok, created} <- DividendIncomeRepo.create(income) do
      {:ok, created}
    end
  end

  defp build_income(investment, attrs) do
    DividendIncome.new(%{
      id: UUID.generate(),
      investment_id: investment.id,
      income_type: attrs[:income_type],
      gross_amount_cents: attrs[:gross_amount_cents],
      net_amount_cents: attrs[:net_amount_cents],
      payment_date: attrs[:payment_date],
      reinvested_transaction_id: attrs[:reinvested_transaction_id]
    })
  end
end
