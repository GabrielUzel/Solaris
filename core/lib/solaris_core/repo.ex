defmodule SolarisCore.Repo do
  use Ecto.Repo,
    otp_app: :solaris_core,
    adapter: Ecto.Adapters.SQLite3
end
