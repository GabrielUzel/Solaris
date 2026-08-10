defmodule SolarisCoreWeb.Api.Mutations.PlannedTransactionMutations do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.PlannedTransactionResolver

  object :planned_transaction_mutations do
    field :create_planned_transaction, non_null(:planned_transaction) do
      arg(:input, non_null(:create_planned_transaction_input))
      resolve(&PlannedTransactionResolver.create_planned_transaction/3)
    end

    field :update_planned_transaction, non_null(:planned_transaction) do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_planned_transaction_input))
      resolve(&PlannedTransactionResolver.update_planned_transaction/3)
    end

    field :deactivate_planned_transaction, non_null(:planned_transaction) do
      arg(:id, non_null(:id))
      resolve(&PlannedTransactionResolver.deactivate_planned_transaction/3)
    end

    field :reactivate_planned_transaction, non_null(:planned_transaction) do
      arg(:id, non_null(:id))
      resolve(&PlannedTransactionResolver.reactivate_planned_transaction/3)
    end

    field :delete_planned_transaction, non_null(:boolean) do
      arg(:id, non_null(:id))
      resolve(&PlannedTransactionResolver.delete_planned_transaction/3)
    end
  end
end
