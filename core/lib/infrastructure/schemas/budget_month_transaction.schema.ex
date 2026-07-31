defmodule SolarisCore.Infrastructure.Schemas.BudgetMonthTransactionSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}
  @foreign_key_type :binary_id

  schema "budget_month_transactions" do
    field :description, :string
    field :amount, :integer
    field :type, Ecto.Enum, values: [:income, :expense]
    field :payment_method, Ecto.Enum, values: [:pix, :bank_transfer, :boleto, :credit_card, :debit_card]
    field :occurred_on, :date
    field :origin, Ecto.Enum, values: [:manual, :planned]
    field :status, Ecto.Enum, values: [:expected, :confirmed, :skipped]
    field :notes, :string

    belongs_to :budget_month, SolarisCore.Infrastructure.Schemas.BudgetMonthSchema
    belongs_to :category, SolarisCore.Infrastructure.Schemas.CategorySchema
    belongs_to :planned_transaction, SolarisCore.Infrastructure.Schemas.PlannedTransactionSchema,
      foreign_key: :planned_transaction_id,
      references: :id,
      type: :binary_id

    timestamps()
  end

  def changeset(transaction, attrs) do
    transaction
    |> cast(attrs, [:id, :description, :amount, :type, :category_id, :payment_method, :occurred_on, :origin, :status, :notes, :budget_month_id, :planned_transaction_id])
    |> validate_required([:id, :description, :amount, :type, :category_id, :payment_method, :occurred_on, :origin, :status, :budget_month_id])
    |> validate_number(:amount, greater_than: 0)
    |> foreign_key_constraint(:budget_month_id)
    |> foreign_key_constraint(:category_id)
    |> foreign_key_constraint(:planned_transaction_id)
  end
end
