defmodule SolarisCore.Application.Commands.UpdateCreditCard do
  alias SolarisCore.Finance.Domain.CreditCard
  alias SolarisCore.Infrastructure.Repositories.CreditCardRepo

  @spec execute(String.t(), map()) :: {:ok, CreditCard.t()} | {:error, term()}
  def execute(id, attrs) do
    with {:ok, existing} <- fetch_credit_card(id),
         merged <- Map.merge(Map.from_struct(existing), attrs),
         {:ok, updated} <- CreditCard.new(merged) do
      CreditCardRepo.update(updated)
    end
  end

  defp fetch_credit_card(id) do
    case CreditCardRepo.get(id) do
      {:error, :not_found} -> {:error, :credit_card_not_found}
      result -> result
    end
  end
end
