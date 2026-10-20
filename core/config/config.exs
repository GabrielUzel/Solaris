import Config

config :solaris_core,
  ecto_repos: [SolarisCore.Repo],
  generators: [timestamp_type: :utc_datetime]

config :solaris_core, SolarisCoreWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: SolarisCoreWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: SolarisCore.PubSub

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

config :solaris_core, :market_data,
  http_adapter: SolarisCore.Infrastructure.MarketData.HttpcAdapter

config :solaris_core, :brapi, base_url: "https://brapi.dev"
config :solaris_core, :finnhub, base_url: "https://finnhub.io/api/v1"

config :solaris_core,
       :asset_price_provider,
       SolarisCore.Infrastructure.MarketData.AssetPriceProviderImpl

config :solaris_core,
       :exchange_rate_provider,
       SolarisCore.Infrastructure.MarketData.ExchangeRateProviderImpl

import_config "#{config_env()}.exs"
