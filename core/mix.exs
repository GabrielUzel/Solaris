defmodule SolarisCore.MixProject do
  use Mix.Project

  def project do
    [
      app: :solaris_core,
      version: "0.5.5",
      elixir: "~> 1.17",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      releases: releases()
    ]
  end

  def application do
    [
      mod: {SolarisCore.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:phoenix, "~> 1.7.24"},
      {:phoenix_ecto, "~> 4.7"},
      {:ecto_sql, "~> 3.14"},
      {:ecto_sqlite3, ">= 0.0.0"},
      {:phoenix_live_dashboard, "~> 0.8.7"},
      {:phoenix_live_view, "~> 1.2.9"},
      {:telemetry_metrics, "~> 1.1"},
      {:telemetry_poller, "~> 1.3"},
      {:gettext, "~> 0.26"},
      {:jason, "~> 1.4"},
      {:dns_cluster, "~> 0.1.3"},
      {:bandit, "~> 1.12.5"},
      {:absinthe, "~> 1.11"},
      {:absinthe_plug, "~> 1.5.10"},
      {:cors_plug, "~> 3.0.3"},
      {:burrito, "~> 1.6"},
      {:dataloader, "~> 2.0.2"}
    ]
  end

  def releases do
    [
      solaris_core: [
        steps: [:assemble, &Burrito.wrap/1],
        burrito: [
          targets: [
            linux: [os: :linux, cpu: :x86_64],
            windows: [os: :windows, cpu: :x86_64]
          ]
        ]
      ]
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "ecto.setup"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end
end
