defmodule SolarisCoreWeb.Router do
  use SolarisCoreWeb, :router

  pipeline :api do
    plug(:accepts, ["json"])
  end

  scope "/api", SolarisCoreWeb do
    pipe_through(:api)
  end

  if Application.compile_env(:solaris_core, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through([:fetch_session, :protect_from_forgery])

      live_dashboard("/dashboard", metrics: SolarisCoreWeb.Telemetry)
    end
  end
end
