defmodule SolarisCore.Repo.Migrations.AddBudgetMonthStatus do
  use Ecto.Migration

  def up do
    alter table(:budget_months) do
      add(:status, :string, null: false, default: "ongoing")
    end

    today = Date.utc_today()
    current_year = today.year
    current_month = today.month

    execute("""
    UPDATE budget_months SET status = 'ongoing'
    WHERE (reference_year > #{current_year})
       OR (reference_year = #{current_year} AND reference_month >= #{current_month})
    """)

    execute("""
    UPDATE budget_months SET status = 'pending'
    WHERE status = 'ongoing'
      AND EXISTS (
        SELECT 1
        FROM budget_month_transactions t
        WHERE t.budget_month_id = budget_months.id
          AND t.type = 'expense'
          AND t.status != 'paid'
      )
    """)

    execute("""
    UPDATE budget_months SET status = 'closed'
    WHERE status = 'ongoing'
      AND (
        reference_year < #{current_year}
        OR (reference_year = #{current_year} AND reference_month < #{current_month})
      )
    """)

    create(index(:budget_months, [:status, :reference_year, :reference_month]))
  end

  def down do
    drop(index(:budget_months, [:status, :reference_year, :reference_month]))
    alter(table(:budget_months), do: remove(:status))
  end
end
