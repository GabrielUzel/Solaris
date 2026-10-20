defmodule SolarisCore.Finance.Domain.AssetPriceProvider do
  alias SolarisCore.Finance.Domain.Asset

  @callback fetch_price(asset :: Asset.t(), date :: Date.t()) ::
              {:ok, close_price_cents :: integer()}
              | {:error, :no_public_price, indexer_value: Decimal.t() | nil}
              | {:error, term()}
end
