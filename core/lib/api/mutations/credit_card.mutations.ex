defmodule SolarisCoreWeb.Api.Mutations.CreditCardMutations do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.CreditCardResolver

  object :credit_card_mutations do
    field :create_credit_card, non_null(:credit_card) do
      arg(:input, non_null(:create_credit_card_input))
      resolve(&CreditCardResolver.create_credit_card/3)
    end

    field :update_credit_card, non_null(:credit_card) do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_credit_card_input))
      resolve(&CreditCardResolver.update_credit_card/3)
    end

    field :deactivate_credit_card, non_null(:credit_card) do
      arg(:id, non_null(:id))
      resolve(&CreditCardResolver.deactivate_credit_card/3)
    end

    field :create_credit_card_purchase, non_null(list_of(non_null(:budget_month_transaction))) do
      arg(:input, non_null(:create_credit_card_purchase_input))
      resolve(&CreditCardResolver.create_credit_card_purchase/3)
    end
  end
end
