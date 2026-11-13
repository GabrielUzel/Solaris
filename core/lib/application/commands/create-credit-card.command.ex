defmodule SolarisCore.Application.Commands.CreateCreditCard do
  alias SolarisCore.Finance.Domain.CreditCard
  alias SolarisCore.Infrastructure.Repositories.CreditCardRepo
  alias Ecto.UUID

  @spec execute(map()) :: {:ok, CreditCard.t()} | {:error, term()}
  def execute(attrs) do
    attrs =
      attrs
      |> Map.put_new(:id, UUID.generate())
      |> Map.put_new(:active, true)

    with {:ok, credit_card} <- CreditCard.new(attrs) do
      CreditCardRepo.create(credit_card)
    end
  end
end
