defmodule SolarisCoreWeb.Api.Queries.AssetQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.AssetResolver

  object :asset_queries do
    field :asset, :asset do
      arg(:id, non_null(:id))
      resolve(&AssetResolver.asset/3)
    end

    field :assets, non_null(list_of(non_null(:asset))) do
      arg(:asset_type, :asset_type)
      arg(:market, :asset_market)
      resolve(&AssetResolver.assets/3)
    end
  end
end
