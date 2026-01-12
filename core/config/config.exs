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

import_config "#{config_env()}.exs"
