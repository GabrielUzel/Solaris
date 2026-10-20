defmodule SolarisCore.Infrastructure.Repositories.AppSettingRepo do
  import Ecto.Query

  alias SolarisCore.Infrastructure.Schemas.AppSetting
  alias SolarisCore.Repo

  @spec get(String.t()) :: {:ok, AppSetting.t()} | {:error, :not_found}
  def get(key) do
    case Repo.get(AppSetting, key) do
      nil -> {:error, :not_found}
      setting -> {:ok, setting}
    end
  end

  @spec upsert(String.t(), String.t()) :: {:ok, AppSetting.t()} | {:error, Ecto.Changeset.t()}
  def upsert(key, value) do
    case Repo.get(AppSetting, key) do
      nil ->
        %AppSetting{}
        |> AppSetting.changeset(%{key: key, value: value})
        |> Repo.insert()

      existing ->
        existing
        |> AppSetting.changeset(%{value: value})
        |> Repo.update()
    end
  end

  @spec delete(String.t()) :: :ok
  def delete(key) do
    Repo.delete_all(from(s in AppSetting, where: s.key == ^key))
    :ok
  end

  @api_key_db_keys ["brapi_token", "finnhub_api_key"]

  @spec get_configured_keys() :: MapSet.t(String.t())
  def get_configured_keys do
    from(s in AppSetting, where: s.key in @api_key_db_keys, select: s.key)
    |> Repo.all()
    |> MapSet.new()
  end
end
