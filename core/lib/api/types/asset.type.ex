defmodule SolarisCoreWeb.Api.Types.AssetTypes do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.AssetResolver

  enum :asset_type do
    value(:stock)
    value(:reit_fii)
    value(:fixed_income)
  end

  enum :asset_market do
    value(:b3)
    value(:us_market)
  end

  enum :asset_indexer do
    value(:CDI)
    value(:SELIC)
    value(:IPCA)
    value(:PREFIXADO)
  end

  object :asset do
    field(:id, non_null(:id))
    field(:ticker, non_null(:string))
    field(:name, non_null(:string))
    field(:asset_type, non_null(:asset_type))
    field(:market, non_null(:asset_market))
    field(:currency, non_null(:string))
    field(:category, :string)
    field(:indexer, :asset_indexer)

    field(:indexer_rate_percent, :float, resolve: &AssetResolver.indexer_rate_percent/3)

    field(:issuer, :string)
    field(:maturity_date, :date)
  end
end
