defmodule SolarisCore.Repo.Migrations.AddCreditCardSupport do
  use Ecto.Migration

  def up do
    execute("""
    CREATE TABLE credit_cards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bank TEXT NOT NULL,
      closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 28),
      due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 28),
      active INTEGER NOT NULL DEFAULT 1,
      inserted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
    """)

    execute("""
    CREATE TABLE budget_month_transactions_new (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      expected_amount INTEGER NOT NULL CHECK (expected_amount > 0),
      actual_amount INTEGER CHECK (actual_amount IS NULL OR actual_amount > 0),
      type TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      occurred_on TEXT NOT NULL,
      origin TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      budget_month_id TEXT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      planned_transaction_id TEXT NULL REFERENCES planned_transactions(id) ON DELETE SET NULL,
      credit_card_id TEXT NULL REFERENCES credit_cards(id) ON DELETE RESTRICT,
      installment_group_id TEXT NULL,
      installment_number INTEGER NULL,
      installments_total INTEGER NULL,
      purchased_on TEXT NULL,
      inserted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK (
        (status = 'expected' AND actual_amount IS NULL) OR
        (status = 'paid' AND actual_amount IS NOT NULL) OR
        (status = 'skipped' AND actual_amount IS NULL)
      )
    )
    """)

    execute("""
    INSERT INTO budget_month_transactions_new (
      id,
      description,
      expected_amount,
      actual_amount,
      type,
      payment_method,
      occurred_on,
      origin,
      status,
      notes,
      budget_month_id,
      category_id,
      planned_transaction_id,
      credit_card_id,
      installment_group_id,
      installment_number,
      installments_total,
      purchased_on,
      inserted_at,
      updated_at
    )
    SELECT
      id,
      description,
      expected_amount,
      actual_amount,
      type,
      payment_method,
      occurred_on,
      origin,
      status,
      notes,
      budget_month_id,
      category_id,
      planned_transaction_id,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      inserted_at,
      updated_at
    FROM budget_month_transactions
    """)

    execute("""
    DROP TABLE budget_month_transactions
    """)

    execute("""
    ALTER TABLE budget_month_transactions_new RENAME TO budget_month_transactions
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_budget_month_id_index
    ON budget_month_transactions (budget_month_id)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_category_id_index
    ON budget_month_transactions (category_id)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_planned_transaction_id_index
    ON budget_month_transactions (planned_transaction_id)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_type_index
    ON budget_month_transactions (type)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_status_index
    ON budget_month_transactions (status)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_origin_index
    ON budget_month_transactions (origin)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_credit_card_id_index
    ON budget_month_transactions (credit_card_id)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_installment_group_id_index
    ON budget_month_transactions (installment_group_id)
    """)
  end

  def down do
    execute("""
    CREATE TABLE budget_month_transactions_old (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      expected_amount INTEGER NOT NULL CHECK (expected_amount > 0),
      actual_amount INTEGER CHECK (actual_amount IS NULL OR actual_amount > 0),
      type TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      occurred_on TEXT NOT NULL,
      origin TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      budget_month_id TEXT NOT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      planned_transaction_id TEXT NULL REFERENCES planned_transactions(id) ON DELETE SET NULL,
      inserted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK (
        (status = 'expected' AND actual_amount IS NULL) OR
        (status = 'paid' AND actual_amount IS NOT NULL) OR
        (status = 'skipped' AND actual_amount IS NULL)
      )
    )
    """)

    execute("""
    INSERT INTO budget_month_transactions_old (
      id,
      description,
      expected_amount,
      actual_amount,
      type,
      payment_method,
      occurred_on,
      origin,
      status,
      notes,
      budget_month_id,
      category_id,
      planned_transaction_id,
      inserted_at,
      updated_at
    )
    SELECT
      id,
      description,
      expected_amount,
      actual_amount,
      type,
      payment_method,
      occurred_on,
      origin,
      status,
      notes,
      budget_month_id,
      category_id,
      planned_transaction_id,
      inserted_at,
      updated_at
    FROM budget_month_transactions
    WHERE budget_month_id IS NOT NULL
    """)

    execute("""
    DROP TABLE budget_month_transactions
    """)

    execute("""
    ALTER TABLE budget_month_transactions_old RENAME TO budget_month_transactions
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_budget_month_id_index
    ON budget_month_transactions (budget_month_id)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_category_id_index
    ON budget_month_transactions (category_id)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_planned_transaction_id_index
    ON budget_month_transactions (planned_transaction_id)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_type_index
    ON budget_month_transactions (type)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_status_index
    ON budget_month_transactions (status)
    """)

    execute("""
    CREATE INDEX IF NOT EXISTS budget_month_transactions_origin_index
    ON budget_month_transactions (origin)
    """)

    execute("""
    DROP TABLE credit_cards
    """)
  end
end
