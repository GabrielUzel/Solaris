defmodule SolarisCore.Infrastructure.Schemas.AppSetting do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:key, :string, autogenerate: false}

  schema "app_settings" do
    field(:value, :string)

    timestamps()
  end

  def changeset(setting, attrs) do
    setting
    |> cast(attrs, [:key, :value])
    |> validate_required([:key, :value])
    |> validate_length(:key, min: 1)
    |> validate_length(:value, min: 1)
  end
end
