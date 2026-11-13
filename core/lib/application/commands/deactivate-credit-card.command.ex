defmodule SolarisCore.Application.Commands.DeactivateCreditCard do
  alias SolarisCore.Finance.Domain.CreditCard
  alias SolarisCore.Infrastructure.Repositories.CreditCardRepo

  @spec execute(String.t()) :: {:ok, CreditCard.t()} | {:error, term()}
  def execute(id) do
    with {:ok, existing} <- fetch_credit_card(id),
         {:ok, deactivated} <- CreditCard.deactivate(existing) do
      CreditCardRepo.update(deactivated)
    end
  end

  defp fetch_credit_card(id) do
    case CreditCardRepo.get(id) do
      {:error, :not_found} -> {:error, :credit_card_not_found}
      result -> result
    end
  end
end
