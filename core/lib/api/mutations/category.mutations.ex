defmodule SolarisCoreWeb.Api.Mutations.CategoryMutations do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.CategoryResolver

  object :category_mutations do
    field :create_category, non_null(:category) do
      arg :input, non_null(:create_category_input)
      resolve(&CategoryResolver.create_category/3)
    end

    field :update_category, non_null(:category) do
      arg :id, non_null(:id)
      arg :input, non_null(:update_category_input)
      resolve(&CategoryResolver.update_category/3)
    end

    field :delete_category, non_null(:boolean) do
      arg :id, non_null(:id)
      resolve(&CategoryResolver.delete_category/3)
    end
  end
end
