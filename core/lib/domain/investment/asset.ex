defmodule SolarisCore.Finance.Domain.Asset do
  @enforce_keys [:id, :ticker, :name, :asset_type, :market, :currency, :price_source]
  defstruct [
    :id,
    :ticker,
    :name,
    :asset_type,
    :market,
    :currency,
    :category,
    :price_source,
    :external_symbol,
    :indexer,
    :indexer_rate_percent,
    :issuer,
    :maturity_date,
    :liquidity,
    :created_at,
    :updated_at
  ]

  @type t :: %__MODULE__{
          id: binary(),
          ticker: String.t(),
          name: String.t(),
          asset_type: :stock | :reit_fii | :fixed_income,
          market: :b3 | :us_market,
          currency: :BRL | :USD,
          category: String.t() | nil,
          price_source: :brapi_b3 | :brapi_treasury | :finnhub_us | :manual_curve,
          external_symbol: String.t() | nil,
          indexer: :CDI | :SELIC | :IPCA | :PREFIXADO | nil,
          indexer_rate_percent: Decimal.t() | nil,
          issuer: String.t() | nil,
          maturity_date: Date.t() | nil,
          liquidity: :daily | :maturity_only | nil,
          created_at: term() | nil,
          updated_at: term() | nil
        }

  @asset_types [:stock, :reit_fii, :fixed_income]
  @markets [:b3, :us_market]
  @currencies [:BRL, :USD]
  @price_sources [:brapi_b3, :brapi_treasury, :finnhub_us, :manual_curve]
  @b3_price_sources [:brapi_b3, :brapi_treasury, :manual_curve]
  @indexers [:CDI, :SELIC, :IPCA, :PREFIXADO]
  @liquidities [:daily, :maturity_only]

  def new(attrs) do
    with :ok <- validate_ticker(attrs[:ticker]),
         :ok <- validate_name(attrs[:name]),
         :ok <- validate_asset_type(attrs[:asset_type]),
         :ok <- validate_market(attrs[:market]),
         :ok <- validate_currency(attrs[:currency]),
         :ok <- validate_price_source(attrs[:price_source]),
         :ok <- validate_price_source_by_market(attrs[:market], attrs[:price_source]),
         :ok <- validate_fixed_income_fields(attrs) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  def foreign_currency?(%__MODULE__{currency: :USD}), do: true
  def foreign_currency?(%__MODULE__{}), do: false

  defp validate_ticker(ticker) when is_binary(ticker) and byte_size(ticker) > 0, do: :ok
  defp validate_ticker(_), do: {:error, :ticker_required}

  defp validate_name(name) when is_binary(name) and byte_size(name) > 0, do: :ok
  defp validate_name(_), do: {:error, :name_required}

  defp validate_asset_type(type) when type in @asset_types, do: :ok
  defp validate_asset_type(_), do: {:error, :invalid_asset_type}

  defp validate_market(market) when market in @markets, do: :ok
  defp validate_market(_), do: {:error, :invalid_asset_market}

  defp validate_currency(currency) when currency in @currencies, do: :ok
  defp validate_currency(_), do: {:error, :invalid_asset_currency}

  defp validate_price_source(source) when source in @price_sources, do: :ok
  defp validate_price_source(_), do: {:error, :invalid_price_source}

  defp validate_price_source_by_market(:us_market, :finnhub_us), do: :ok

  defp validate_price_source_by_market(:us_market, _),
    do: {:error, :us_market_requires_finnhub_price_source}

  defp validate_price_source_by_market(:b3, source) when source in @b3_price_sources, do: :ok
  defp validate_price_source_by_market(:b3, _), do: {:error, :invalid_b3_price_source}
  defp validate_price_source_by_market(_, _), do: :ok

  defp validate_fixed_income_fields(%{asset_type: :fixed_income} = attrs) do
    with :ok <- validate_indexer(attrs[:indexer]),
         :ok <- validate_issuer(attrs[:issuer]),
         :ok <- validate_maturity_date(attrs[:maturity_date]),
         :ok <- validate_liquidity(attrs[:liquidity]) do
      :ok
    end
  end

  defp validate_fixed_income_fields(attrs) do
    fixed_fields = [:indexer, :issuer, :maturity_date, :liquidity]

    if Enum.any?(fixed_fields, &(not is_nil(attrs[&1]))) do
      {:error, :fixed_income_fields_not_allowed}
    else
      :ok
    end
  end

  defp validate_indexer(indexer) when indexer in @indexers, do: :ok
  defp validate_indexer(_), do: {:error, :indexer_required}

  defp validate_issuer(issuer) when is_binary(issuer) and byte_size(issuer) > 0, do: :ok
  defp validate_issuer(_), do: {:error, :issuer_required}

  defp validate_maturity_date(%Date{}), do: :ok
  defp validate_maturity_date(_), do: {:error, :maturity_date_required}

  defp validate_liquidity(liquidity) when liquidity in @liquidities, do: :ok
  defp validate_liquidity(_), do: {:error, :liquidity_required}
end
