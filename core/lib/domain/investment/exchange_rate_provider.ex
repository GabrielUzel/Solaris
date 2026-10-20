defmodule SolarisCore.Finance.Domain.ExchangeRateProvider do
  @callback fetch_rate(pair :: String.t(), date :: Date.t()) ::
              {:ok, Decimal.t()} | {:error, term()}
end
