defmodule SolarisCore.Repo.Migrations.CreateInvestmentTables do
  use Ecto.Migration

  def change do
    create table(:assets, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:ticker, :string, null: false)
      add(:name, :string, null: false)
      add(:asset_type, :string, null: false)
      add(:market, :string, null: false)
      add(:currency, :string, null: false)
      add(:category, :string)
      add(:price_source, :string, null: false)
      add(:external_symbol, :string)
      add(:indexer, :string)
      add(:indexer_rate_percent, :decimal)
      add(:issuer, :string)
      add(:maturity_date, :date)
      add(:liquidity, :string)

      timestamps()
    end

    create(unique_index(:assets, [:ticker, :market]))
    create(index(:assets, [:asset_type]))

    create table(:investments, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:status, :string, null: false, default: "open")
      add(:opened_at, :date, null: false)
      add(:closed_at, :date)

      add(
        :asset_id,
        references(:assets, type: :binary_id, on_delete: :restrict),
        null: false
      )

      timestamps()
    end

    create(index(:investments, [:asset_id]))
    create(index(:investments, [:status]))

    create table(:investment_transactions, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:transaction_type, :string, null: false)
      add(:input_currency, :string, null: false, default: "BRL")
      add(:amount_invested_cents, :bigint, null: false)
      add(:exchange_rate_used, :decimal)
      add(:amount_invested_usd_cents, :bigint)
      add(:quantity, :decimal)
      add(:unit_price_cents, :bigint)
      add(:transaction_date, :date, null: false)
      add(:fees_cents, :bigint, null: false, default: 0)
      add(:notes, :string)

      add(
        :investment_id,
        references(:investments, type: :binary_id, on_delete: :delete_all),
        null: false
      )

      timestamps()
    end

    create(index(:investment_transactions, [:investment_id]))
    create(index(:investment_transactions, [:transaction_type]))
    create(index(:investment_transactions, [:transaction_date]))

    create table(:asset_price_snapshots, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:reference_date, :date, null: false)
      add(:close_price_cents, :bigint, null: false)
      add(:source, :string, null: false)
      add(:fetched_at, :naive_datetime, null: false)

      add(
        :asset_id,
        references(:assets, type: :binary_id, on_delete: :delete_all),
        null: false
      )
    end

    create(unique_index(:asset_price_snapshots, [:asset_id, :reference_date]))

    create table(:exchange_rate_snapshots, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:pair, :string, null: false)
      add(:reference_date, :date, null: false)
      add(:rate, :decimal, null: false)
      add(:source, :string, null: false)
      add(:fetched_at, :naive_datetime, null: false)
    end

    create(unique_index(:exchange_rate_snapshots, [:pair, :reference_date]))

    create table(:dividends_income, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:income_type, :string, null: false)
      add(:gross_amount_cents, :bigint, null: false)
      add(:net_amount_cents, :bigint, null: false)
      add(:payment_date, :date, null: false)

      add(
        :investment_id,
        references(:investments, type: :binary_id, on_delete: :delete_all),
        null: false
      )

      add(
        :reinvested_transaction_id,
        references(:investment_transactions, type: :binary_id, on_delete: :nilify_all),
        null: true
      )
    end

    create(index(:dividends_income, [:investment_id]))
    create(index(:dividends_income, [:reinvested_transaction_id]))
  end
end
