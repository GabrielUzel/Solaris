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
    field(:active, non_null(:boolean))
    field(:has_open_investment, non_null(:boolean), resolve: &AssetResolver.has_open_investment/3)
    field(:indexer, :asset_indexer)

    field(:indexer_rate_percent, :float, resolve: &AssetResolver.indexer_rate_percent/3)

    field(:issuer, :string)
    field(:maturity_date, :date)
  end

  input_object :create_asset_input do
    field(:ticker, non_null(:string))
    field(:name, non_null(:string))
    field(:asset_type, non_null(:asset_type))
    field(:market, non_null(:asset_market))
    field(:currency, non_null(:string))
    field(:category, :string)
    field(:price_source, non_null(:string))
    field(:external_symbol, :string)
    field(:indexer, :string)
    field(:indexer_rate_percent, :float)
    field(:issuer, :string)
    field(:maturity_date, :date)
    field(:liquidity, :string)
  end

  input_object :validate_asset_ticker_input do
    field(:ticker, non_null(:string))
    field(:asset_type, non_null(:asset_type))
    field(:market, non_null(:asset_market))
    field(:price_source, non_null(:string))
    field(:external_symbol, :string)
  end

  object :asset_ticker_validation do
    field(:valid, non_null(:boolean))
    field(:name, :string)
  end
end
