defmodule SolarisCore.Repo.Migrations.Init do
  use Ecto.Migration

  def change do
    create table(:categories, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:name, :string, null: false)
      add(:type, :string, null: false)
      add(:color, :string, null: false)

      timestamps()
    end

    create(index(:categories, [:type]))

    create table(:planned_transactions, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:description, :string, null: false)
      add(:amount, :bigint, null: false)
      add(:type, :string, null: false)
      add(:payment_method, :string, null: false)
      add(:day_of_month, :integer, null: false)
      add(:starts_on, :date, null: false)
      add(:active, :boolean, null: false, default: true)
      add(:notes, :string)

      add(
        :category_id,
        references(:categories, type: :binary_id, on_delete: :restrict),
        null: false
      )

      timestamps()
    end

    create(index(:planned_transactions, [:category_id]))
    create(index(:planned_transactions, [:active]))
    create(index(:planned_transactions, [:type]))

    create table(:budget_months, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:reference_year, :integer, null: false)
      add(:reference_month, :integer, null: false)
      add(:starts_on, :date, null: false)
      add(:ends_on, :date, null: false)
      add(:initialized_at, :utc_datetime)

      timestamps()
    end

    create(unique_index(:budget_months, [:reference_year, :reference_month]))

    create table(:budget_month_transactions, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:description, :string, null: false)
      add(:amount, :bigint, null: false)
      add(:type, :string, null: false)
      add(:payment_method, :string, null: false)
      add(:occurred_on, :date, null: false)
      add(:origin, :string, null: false)
      add(:status, :string, null: false)
      add(:notes, :string)

      add(
        :budget_month_id,
        references(:budget_months, type: :binary_id, on_delete: :delete_all),
        null: false
      )

      add(
        :category_id,
        references(:categories, type: :binary_id, on_delete: :restrict),
        null: false
      )

      add(
        :planned_transaction_id,
        references(:planned_transactions, type: :binary_id, on_delete: :nilify_all),
        null: true
      )

      timestamps()
    end

    create(index(:budget_month_transactions, [:budget_month_id]))
    create(index(:budget_month_transactions, [:category_id]))
    create(index(:budget_month_transactions, [:planned_transaction_id]))
    create(index(:budget_month_transactions, [:type]))
    create(index(:budget_month_transactions, [:status]))
    create(index(:budget_month_transactions, [:origin]))
  end
end
