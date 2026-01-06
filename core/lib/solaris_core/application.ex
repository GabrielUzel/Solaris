defmodule SolarisCore.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SolarisCoreWeb.Telemetry,
      SolarisCore.Repo,
      {Ecto.Migrator,
       repos: Application.fetch_env!(:solaris_core, :ecto_repos), skip: skip_migrations?()},
      {DNSCluster, query: Application.get_env(:solaris_core, :dns_cluster_query) || :ignore},
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

  defp skip_migrations?() do
    System.get_env("RELEASE_NAME") != nil
  end
end
