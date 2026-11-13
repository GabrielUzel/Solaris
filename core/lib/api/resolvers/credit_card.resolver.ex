defmodule SolarisCoreWeb.Api.Resolvers.CreditCardResolver do
  alias SolarisCore.Application.Commands.CreateCreditCard
  alias SolarisCore.Application.Commands.CreateCreditCardPurchase
  alias SolarisCore.Application.Commands.DeactivateCreditCard
  alias SolarisCore.Application.Commands.UpdateCreditCard
  alias SolarisCore.Application.Queries.GetCreditCardInvoices
  alias SolarisCore.Application.Queries.ListCreditCards

  import SolarisCoreWeb.Api.ErrorMessages, only: [translate: 1]

  def list_credit_cards(_parent, _args, _resolution) do
    ListCreditCards.execute() |> translate()
  end

  def get_credit_card_invoices(_parent, %{card_id: card_id}, _resolution) do
    GetCreditCardInvoices.execute(card_id) |> translate()
  end

  def create_credit_card(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> CreateCreditCard.execute()
    |> translate()
  end

  def update_credit_card(_parent, %{id: id, input: input}, _resolution) do
    UpdateCreditCard.execute(id, to_domain_attrs(input)) |> translate()
  end

  def deactivate_credit_card(_parent, %{id: id}, _resolution) do
    DeactivateCreditCard.execute(id) |> translate()
  end

  def create_credit_card_purchase(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> CreateCreditCardPurchase.execute()
    |> translate()
  end

  defp to_domain_attrs(input) do
    input
    |> Map.new(fn {k, v} -> {k, v} end)
  end
end
