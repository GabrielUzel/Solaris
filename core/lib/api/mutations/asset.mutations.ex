defmodule SolarisCoreWeb.Api.Mutations.AssetMutations do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.AssetResolver

  object :asset_mutations do
    field :create_asset, non_null(:asset) do
      arg(:input, non_null(:create_asset_input))
      resolve(&AssetResolver.create_asset/3)
    end

    field :deactivate_asset, non_null(:asset) do
      arg(:id, non_null(:id))
      resolve(&AssetResolver.deactivate_asset/3)
    end

    field :reactivate_asset, non_null(:asset) do
      arg(:id, non_null(:id))
      resolve(&AssetResolver.reactivate_asset/3)
    end
  end
end
