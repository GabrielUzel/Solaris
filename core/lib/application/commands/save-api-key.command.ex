defmodule SolarisCore.Application.Commands.SaveApiKey do
  alias SolarisCore.Infrastructure.Repositories.AppSettingRepo

  @providers %{
    "brapi" => "brapi_token",
    "finnhub" => "finnhub_api_key"
  }

  @spec execute(String.t(), String.t()) ::
          {:ok, map()} | {:error, :invalid_provider | :invalid_key}
  def execute(provider, key) when is_binary(provider) and is_binary(key) do
    if String.trim(key) == "" do
      {:error, :invalid_key}
    else
      case Map.get(@providers, provider) do
        nil ->
          {:error, :invalid_provider}

        db_key ->
          case AppSettingRepo.upsert(db_key, String.trim(key)) do
            {:ok, _setting} -> {:ok, %{provider: provider, configured: true}}
            {:error, changeset} -> {:error, changeset}
          end
      end
    end
  end
end
