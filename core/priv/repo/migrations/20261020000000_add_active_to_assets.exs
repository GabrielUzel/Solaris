defmodule SolarisCore.Repo.Migrations.AddActiveToAssets do
  use Ecto.Migration

  def change do
    alter table(:assets) do
      add(:active, :boolean, null: false, default: true)
    end
  end
end
