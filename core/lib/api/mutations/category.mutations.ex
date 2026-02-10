defmodule SolarisCoreWeb.Api.Mutations.CategoryMutations do
  use Absinthe.Schema.Notation
  alias SolarisCoreWeb.Api.Resolvers.CategoryResolver

  object :category_mutations do
    field :create_category, :category do
      arg(:input, non_null(:create_category_input))
      resolve(&CategoryResolver.create/3)
    end

    field :update_category, :category do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_category_input))
      resolve(&CategoryResolver.update/3)
    end

    field :delete_category, :boolean do
      arg(:id, non_null(:id))
      resolve(&CategoryResolver.delete/3)
    end
  end
end
