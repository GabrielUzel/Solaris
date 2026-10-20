defmodule SolarisCore.Application.Queries.GetApiKeys do
  alias SolarisCore.Infrastructure.Repositories.AppSettingRepo

  @providers [
    %{provider: "brapi", db_key: "brapi_token"},
    %{provider: "finnhub", db_key: "finnhub_api_key"}
  ]

  @spec execute() :: {:ok, [map()]}
  def execute do
    configured = AppSettingRepo.get_configured_keys()

    statuses =
      Enum.map(@providers, fn %{provider: provider, db_key: db_key} ->
        %{provider: provider, configured: MapSet.member?(configured, db_key)}
      end)

    {:ok, statuses}
  end
end
