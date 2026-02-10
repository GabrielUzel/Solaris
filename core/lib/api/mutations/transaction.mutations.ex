defmodule SolarisCoreWeb.Api.Mutations.TransactionMutations do
  use Absinthe.Schema.Notation
  alias SolarisCoreWeb.Api.Resolvers.TransactionResolver

  object :transaction_mutations do
    field :create_transaction, :transaction do
      arg(:input, non_null(:create_transaction_input))
      resolve(&TransactionResolver.create/3)
    end

    field :update_transaction, :transaction do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_transaction_input))
      resolve(&TransactionResolver.update/3)
    end

    field :delete_transaction, :boolean do
      arg(:id, non_null(:id))
      resolve(&TransactionResolver.delete/3)
    end
  end
end
