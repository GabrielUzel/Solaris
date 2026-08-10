defmodule SolarisCore.Infrastructure.Schemas.TransactionSchema do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}
  @foreign_key_type :binary_id

  schema "budget_month_transactions" do
    field(:description, :string)
    field(:expected_amount, :integer)
    field(:actual_amount, :integer)
    field(:type, Ecto.Enum, values: [:income, :expense])

    field(:payment_method, Ecto.Enum,
      values: [:pix, :bank_transfer, :boleto, :credit_card, :debit_card]
    )

    field(:occurred_on, :date)
    field(:origin, Ecto.Enum, values: [:manual, :planned])
    field(:status, Ecto.Enum, values: [:expected, :paid, :skipped])
    field(:notes, :string)

    belongs_to(:budget_month, SolarisCore.Infrastructure.Schemas.BudgetMonthSchema)
    belongs_to(:category, SolarisCore.Infrastructure.Schemas.CategorySchema)

    belongs_to(:planned_transaction, SolarisCore.Infrastructure.Schemas.PlannedTransactionSchema,
      foreign_key: :planned_transaction_id,
      references: :id,
      type: :binary_id
    )

    timestamps()
  end

  def changeset(transaction, attrs) do
    transaction
    |> cast(attrs, [
      :id,
      :description,
      :expected_amount,
      :actual_amount,
      :type,
      :category_id,
      :payment_method,
      :occurred_on,
      :origin,
      :status,
      :notes,
      :budget_month_id,
      :planned_transaction_id
    ])
    |> validate_required([
      :id,
      :description,
      :expected_amount,
      :type,
      :category_id,
      :payment_method,
      :occurred_on,
      :origin,
      :status,
      :budget_month_id
    ])
    |> validate_number(:expected_amount, greater_than: 0)
    |> validate_number(:actual_amount, greater_than: 0)
    |> validate_actual_amount_by_status()
    |> foreign_key_constraint(:budget_month_id)
    |> foreign_key_constraint(:category_id)
    |> foreign_key_constraint(:planned_transaction_id)
  end

  defp validate_actual_amount_by_status(changeset) do
    status = get_field(changeset, :status)
    actual_amount = get_field(changeset, :actual_amount)

    case {status, actual_amount} do
      {:expected, nil} ->
        changeset

      {:paid, amount} when is_integer(amount) and amount > 0 ->
        changeset

      {:skipped, nil} ->
        changeset

      {:expected, _} ->
        add_error(changeset, :actual_amount, "must be empty when status is expected")

      {:paid, _} ->
        add_error(changeset, :actual_amount, "is required when status is paid")

      {:skipped, _} ->
        add_error(changeset, :actual_amount, "must be empty when status is skipped")

      _ ->
        changeset
    end
  end
end
