defmodule SolarisCoreWeb.Api.Resolvers.SettingsResolver do
  alias SolarisCore.Application.Commands.DeleteApiKey
  alias SolarisCore.Application.Commands.SaveApiKey
  alias SolarisCore.Application.Queries.GetApiKeys

  def api_key_statuses(_parent, _args, _resolution) do
    GetApiKeys.execute()
  end

  def save_api_key(_parent, %{input: input}, _resolution) do
    case SaveApiKey.execute(input.provider, input.key) do
      {:ok, status} ->
        {:ok, status}

      {:error, :invalid_provider} ->
        {:error, "Provedor inválido. Use \"brapi\" ou \"finnhub\"."}

      {:error, :invalid_key} ->
        {:error, "A chave não pode ser vazia."}

      {:error, %Ecto.Changeset{}} ->
        {:error, "Não foi possível salvar a chave. Verifique o valor informado."}
    end
  end

  def delete_api_key(_parent, %{provider: provider}, _resolution) do
    case DeleteApiKey.execute(provider) do
      {:ok, status} ->
        {:ok, status}

      {:error, :invalid_provider} ->
        {:error, "Provedor inválido. Use \"brapi\" ou \"finnhub\"."}
    end
  end
end
