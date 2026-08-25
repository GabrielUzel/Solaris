defmodule SolarisCore.Infrastructure.Repositories.AssetRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.AssetSchema
  alias SolarisCore.Finance.Domain.Asset
  import Ecto.Query

  def create(%Asset{} = domain_asset) do
    %AssetSchema{}
    |> AssetSchema.changeset(to_schema_attrs(domain_asset))
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def get(id) do
    case Repo.get(AssetSchema, id) do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def get_by_ticker_and_market(ticker, market) do
    AssetSchema
    |> where([a], a.ticker == ^ticker and a.market == ^market)
    |> Repo.one()
    |> case do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def list(filters \\ []) do
    AssetSchema
    |> apply_filters(filters)
    |> order_by([a], asc: a.ticker)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  defp apply_filters(query, filters) do
    Enum.reduce(filters, query, fn
      {:ids, ids}, acc -> where(acc, [a], a.id in ^ids)
      {:asset_type, asset_type}, acc -> where(acc, [a], a.asset_type == ^asset_type)
      {:market, market}, acc -> where(acc, [a], a.market == ^market)
      _, acc -> acc
    end)
  end

  defp to_schema_attrs(%Asset{} = domain) do
    %{
      ticker: domain.ticker,
      name: domain.name,
      asset_type: domain.asset_type,
      market: domain.market,
      currency: domain.currency,
      category: domain.category,
      price_source: domain.price_source,
      external_symbol: domain.external_symbol,
      indexer: domain.indexer,
      indexer_rate_percent: domain.indexer_rate_percent,
      issuer: domain.issuer,
      maturity_date: domain.maturity_date,
      liquidity: domain.liquidity
    }
  end

  defp to_domain(%AssetSchema{} = schema) do
    {:ok, asset} =
      Asset.new(%{
        id: schema.id,
        ticker: schema.ticker,
        name: schema.name,
        asset_type: schema.asset_type,
        market: schema.market,
        currency: schema.currency,
        category: schema.category,
        price_source: schema.price_source,
        external_symbol: schema.external_symbol,
        indexer: schema.indexer,
        indexer_rate_percent: schema.indexer_rate_percent,
        issuer: schema.issuer,
        maturity_date: schema.maturity_date,
        liquidity: schema.liquidity,
        created_at: schema.inserted_at,
        updated_at: schema.updated_at
      })

    asset
  end
end
