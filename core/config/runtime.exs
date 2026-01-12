import Config

if System.get_env("PHX_SERVER") do
  config :solaris_core, SolarisCoreWeb.Endpoint, server: true
end

if config_env() == :prod do
  database_path =
    System.get_env("DATABASE_PATH") ||
      raise """
      DATABASE_PATH is missing.
      In a Desktop/Tauri context, this must be passed by the wrapper.
      """

  config :solaris_core, SolarisCore.Repo,
    database: database_path,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "5")

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      Base.encode64(:crypto.strong_rand_bytes(48))

  host = "localhost"

  port = String.to_integer(System.get_env("PORT") || "0")

  config :solaris_core, SolarisCoreWeb.Endpoint,
    url: [host: host, port: port, scheme: "http"],
    http: [
      ip: {127, 0, 0, 1},
      port: port
    ],
    secret_key_base: secret_key_base
end
