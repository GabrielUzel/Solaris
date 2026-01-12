defmodule SolarisCoreWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :solaris_core

  plug(CORSPlug, origin: ["tauri://localhost", "http://localhost:1420"])

  @session_options [
    store: :cookie,
    key: "_solaris_core_key",
    signing_salt: System.get_env("SIGNING_SALT") || "dev_signing_salt",
    same_site: "Lax"
  ]

  plug(Plug.Static,
    at: "/",
    from: :solaris_core,
    gzip: false,
    only: SolarisCoreWeb.static_paths()
  )

  if code_reloading? do
    plug(Phoenix.CodeReloader)
    plug(Phoenix.Ecto.CheckRepoStatus, otp_app: :solaris_core)
  end

  plug(Plug.RequestId)
  plug(Plug.Telemetry, event_prefix: [:phoenix, :endpoint])

  plug(Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()
  )

  plug(Plug.MethodOverride)
  plug(Plug.Head)
  plug(Plug.Session, @session_options)
  plug(SolarisCoreWeb.Router)
end
