defmodule SolarisCore.Repo.Migrations.AddExpectedAndActualAmountToBudgetMonthTransactions do
  use Ecto.Migration

  def up do
    alter table(:budget_month_transactions) do
      add(:expected_amount, :bigint)
      add(:actual_amount, :bigint)
    end

    execute("""
    UPDATE budget_month_transactions
    SET expected_amount = amount
    """)

    execute("""
    UPDATE budget_month_transactions
    SET actual_amount = amount
    WHERE status = 'confirmed'
    """)

    execute("""
    UPDATE budget_month_transactions
    SET status = 'paid'
    WHERE status = 'confirmed'
    """)

    execute("""
    ALTER TABLE budget_month_transactions
    ALTER COLUMN expected_amount SET NOT NULL
    """)

    execute("""
    ALTER TABLE budget_month_transactions
    ADD CONSTRAINT budget_month_transactions_expected_amount_positive
    CHECK (expected_amount > 0)
    """)

    execute("""
    ALTER TABLE budget_month_transactions
    ADD CONSTRAINT budget_month_transactions_actual_amount_positive
    CHECK (actual_amount IS NULL OR actual_amount > 0)
    """)

    execute("""
    ALTER TABLE budget_month_transactions
    ADD CONSTRAINT budget_month_transactions_status_actual_amount_consistency
    CHECK (
      (status = 'expected' AND actual_amount IS NULL) OR
      (status = 'paid' AND actual_amount IS NOT NULL) OR
      (status = 'skipped' AND actual_amount IS NULL)
    )
    """)

    alter table(:budget_month_transactions) do
      remove(:amount)
    end
  end

  def down do
    alter table(:budget_month_transactions) do
      add(:amount, :bigint)
    end

    execute("""
    UPDATE budget_month_transactions
    SET amount = COALESCE(actual_amount, expected_amount)
    """)

    execute("""
    UPDATE budget_month_transactions
    SET status = 'confirmed'
    WHERE status = 'paid'
    """)

    execute("""
    ALTER TABLE budget_month_transactions
    DROP CONSTRAINT IF EXISTS budget_month_transactions_status_actual_amount_consistency
    """)

    execute("""
    ALTER TABLE budget_month_transactions
    DROP CONSTRAINT IF EXISTS budget_month_transactions_actual_amount_positive
    """)

    execute("""
    ALTER TABLE budget_month_transactions
    DROP CONSTRAINT IF EXISTS budget_month_transactions_expected_amount_positive
    """)

    alter table(:budget_month_transactions) do
      remove(:actual_amount)
      remove(:expected_amount)
    end
  end
end
