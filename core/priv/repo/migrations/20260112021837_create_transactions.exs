defmodule SolarisCore.Repo.Migrations.CreateTransactions do
  use Ecto.Migration

  def change do
    create table(:transactions, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:amount, :integer)
      add(:type, :string)
      add(:date, :date)
      add(:description, :string)
      add(:category_id, :binary_id)

      timestamps()
    end

    create(index(:transactions, [:type]))
    create(index(:transactions, [:date]))
    create(index(:transactions, [:category_id]))
  end
end
