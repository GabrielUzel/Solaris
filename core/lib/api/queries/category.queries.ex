defmodule SolarisCoreWeb.Api.Queries.CategoryQueries do
  use Absinthe.Schema.Notation
  alias SolarisCoreWeb.Api.Resolvers.CategoryResolver

  object :category_queries do
    field :categories, non_null(list_of(non_null(:category))) do
      resolve(&CategoryResolver.get_all/3)
    end

    field :category_by_name, :category do
      arg(:name, non_null(:string))
      resolve(&CategoryResolver.get_by_name/3)
    end
  end
end
