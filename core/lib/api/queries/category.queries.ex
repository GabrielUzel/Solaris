defmodule SolarisCoreWeb.Api.Queries.CategoryQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.CategoryResolver

  object :category_queries do
    field :list_categories, non_null(list_of(non_null(:category))) do
      resolve(&CategoryResolver.list_categories/3)
    end

    field :list_categories_by_type, non_null(list_of(non_null(:category))) do
      arg :type, non_null(:financial_type)
      resolve(&CategoryResolver.list_categories_by_type/3)
    end

    field :get_category_by_id, :category do
      arg :id, non_null(:id)
      resolve(&CategoryResolver.get_category_by_id/3)
    end
  end
end
