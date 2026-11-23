defmodule SolarisCoreWeb.Api.Queries.CreditCardQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.CreditCardResolver

  object :credit_card_queries do
    field :list_credit_cards, non_null(list_of(non_null(:credit_card))) do
      resolve(&CreditCardResolver.list_credit_cards/3)
    end

    field :get_credit_card_invoices, :credit_card_invoices do
      arg(:card_id, non_null(:id))
      resolve(&CreditCardResolver.get_credit_card_invoices/3)
    end
  end
end
