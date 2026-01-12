defmodule SolarisCore.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    ensure_database_directory_exists()

    children = [
      SolarisCoreWeb.Telemetry,
      SolarisCore.Repo,
      {
        Ecto.Migrator,
        repos: Application.fetch_env!(:solaris_core, :ecto_repos), skip: false
      },
      {Phoenix.PubSub, name: SolarisCore.PubSub},
      SolarisCoreWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: SolarisCore.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    SolarisCoreWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  defp ensure_database_directory_exists do
    conf = Application.get_env(:solaris_core, SolarisCore.Repo)
    database_path = conf[:database]

    if database_path do
      database_path
      |> Path.dirname()
      |> File.mkdir_p()
    end
  end
end
