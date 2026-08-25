defmodule SolarisCore.Infrastructure.Schemas.AssetSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @fixed_income_fields [:indexer, :issuer, :maturity_date, :liquidity]
  @b3_price_sources [:brapi_b3, :brapi_treasury, :manual_curve]

  schema "assets" do
    field(:ticker, :string)
    field(:name, :string)
    field(:asset_type, Ecto.Enum, values: [:stock, :reit_fii, :fixed_income])
    field(:market, Ecto.Enum, values: [:b3, :us_market])
    field(:currency, Ecto.Enum, values: [:BRL, :USD])
    field(:category, :string)

    field(:price_source, Ecto.Enum,
      values: [:brapi_b3, :brapi_treasury, :finnhub_us, :manual_curve]
    )

    field(:external_symbol, :string)
    field(:indexer, Ecto.Enum, values: [:CDI, :SELIC, :IPCA, :PREFIXADO])
    field(:indexer_rate_percent, :decimal)
    field(:issuer, :string)
    field(:maturity_date, :date)
    field(:liquidity, Ecto.Enum, values: [:daily, :maturity_only])

    has_many(:investments, SolarisCore.Infrastructure.Schemas.InvestmentSchema,
      foreign_key: :asset_id
    )

    has_many(:price_snapshots, SolarisCore.Infrastructure.Schemas.AssetPriceSnapshotSchema,
      foreign_key: :asset_id
    )

    timestamps()
  end

  def changeset(asset, attrs) do
    asset
    |> cast(attrs, [
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
      :liquidity
    ])
    |> validate_required([:ticker, :name, :asset_type, :market, :currency, :price_source])
    |> validate_fixed_income_fields()
    |> validate_price_source_by_market()
    |> unique_constraint([:ticker, :market])
  end

  defp validate_fixed_income_fields(changeset) do
    if get_field(changeset, :asset_type) == :fixed_income do
      validate_required(changeset, @fixed_income_fields)
    else
      Enum.reduce(@fixed_income_fields, changeset, fn field, acc ->
        if is_nil(get_field(acc, field)) do
          acc
        else
          add_error(acc, field, "must be empty when asset_type is not fixed_income")
        end
      end)
    end
  end

  defp validate_price_source_by_market(changeset) do
    market = get_field(changeset, :market)
    price_source = get_field(changeset, :price_source)

    cond do
      is_nil(market) or is_nil(price_source) ->
        changeset

      market == :us_market and price_source != :finnhub_us ->
        add_error(changeset, :price_source, "must be finnhub_us when market is us_market")

      market == :b3 and price_source not in @b3_price_sources ->
        add_error(
          changeset,
          :price_source,
          "must be brapi_b3, brapi_treasury or manual_curve when market is b3"
        )

      true ->
        changeset
    end
  end
end
