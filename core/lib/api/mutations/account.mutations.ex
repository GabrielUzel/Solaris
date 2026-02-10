defmodule SolarisCoreWeb.Api.Mutations.AccountMutations do
  use Absinthe.Schema.Notation
  alias SolarisCoreWeb.Api.Resolvers.AccountResolver

  object :account_mutations do
    field :create_account, :account do
      arg(:input, non_null(:create_account_input))
      resolve(&AccountResolver.create/3)
    end

    field :update_account, :account do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_account_input))
      resolve(&AccountResolver.update/3)
    end

    field :delete_account, :boolean do
      arg(:id, non_null(:id))
      resolve(&AccountResolver.delete/3)
    end
  end
end
