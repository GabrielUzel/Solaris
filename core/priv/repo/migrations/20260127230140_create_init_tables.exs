defmodule SolarisCore.Repo.Migrations.CreateFinanceTables do
  use Ecto.Migration

  def change do
    create table(:accounts, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:name, :string, null: false)
      add(:type, :string, null: false)

      timestamps()
    end

    create(index(:accounts, [:type]))

    create table(:categories, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:name, :string, null: false)
      add(:type, :string, null: false)
      add(:color, :string)

      timestamps()
    end

    create(index(:categories, [:type]))

    create table(:transactions, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:amount, :bigint, null: false)
      add(:type, :string, null: false)
      add(:date, :date, null: false)
      add(:description, :string, null: false)

      add(:recurrence_frequency, :string, null: false, default: "once")
      add(:recurrence_interval, :integer, default: 1)
      add(:recurrence_day_of_month, :integer)
      add(:recurrence_end_date, :date)

      add(:account_id, references(:accounts, type: :binary_id, on_delete: :delete_all),
        null: false
      )

      add(:category_id, references(:categories, type: :binary_id, on_delete: :restrict),
        null: false
      )

      timestamps()
    end

    create(index(:transactions, [:account_id]))
    create(index(:transactions, [:category_id]))
    create(index(:transactions, [:date]))
    create(index(:transactions, [:recurrence_frequency]))
    create(index(:transactions, [:type]))
  end
end
