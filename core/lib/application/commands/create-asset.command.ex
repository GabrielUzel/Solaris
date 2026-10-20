defmodule SolarisCore.Application.Commands.CreateAsset do
  alias Ecto.UUID
  alias SolarisCore.Finance.Domain.Asset
  alias SolarisCore.Infrastructure.MarketData.TickerVerifier
  alias SolarisCore.Infrastructure.Repositories.AssetRepo

  @spec execute(map()) :: {:ok, Asset.t()} | {:error, term()}
  def execute(attrs) do
    with :ok <- ensure_not_duplicated(attrs),
         {:ok, asset} <- build_asset(attrs),
         :ok <- verify_ticker(asset),
         {:ok, created} <- AssetRepo.create(asset) do
      {:ok, created}
    end
  end

  defp ensure_not_duplicated(%{ticker: ticker, market: market})
       when is_binary(ticker) and not is_nil(market) do
    case AssetRepo.get_by_ticker_and_market(ticker, market) do
      {:ok, %{active: false}} -> {:error, :asset_deactivated}
      {:ok, _existing} -> {:error, :asset_already_exists}
      {:error, :not_found} -> :ok
    end
  end

  defp ensure_not_duplicated(_attrs), do: :ok

  defp build_asset(attrs) do
    Asset.new(%{
      id: UUID.generate(),
      ticker: attrs[:ticker],
      name: attrs[:name],
      asset_type: attrs[:asset_type],
      market: attrs[:market],
      currency: attrs[:currency],
      category: attrs[:category],
      price_source: attrs[:price_source],
      external_symbol: attrs[:external_symbol],
      indexer: attrs[:indexer],
      indexer_rate_percent: attrs[:indexer_rate_percent],
      issuer: attrs[:issuer],
      maturity_date: attrs[:maturity_date],
      liquidity: attrs[:liquidity]
    })
  end

  defp verify_ticker(%Asset{} = asset) do
    TickerVerifier.verify(%{
      asset_type: asset.asset_type,
      market: asset.market,
      price_source: asset.price_source,
      external_symbol: asset.external_symbol,
      ticker: asset.ticker
    })
  end
end
