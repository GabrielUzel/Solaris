defmodule SolarisCore.Application.Commands.DeleteApiKey do
  alias SolarisCore.Infrastructure.Repositories.AppSettingRepo

  @providers %{
    "brapi" => "brapi_token",
    "finnhub" => "finnhub_api_key"
  }

  @spec execute(String.t()) :: {:ok, map()} | {:error, :invalid_provider}
  def execute(provider) when is_binary(provider) do
    case Map.get(@providers, provider) do
      nil ->
        {:error, :invalid_provider}

      db_key ->
        AppSettingRepo.delete(db_key)
        {:ok, %{provider: provider, configured: false}}
    end
  end
end
