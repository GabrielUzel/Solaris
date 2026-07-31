defmodule SolarisCoreWeb.Api.Types.BudgetMonthTypes do
  use Absinthe.Schema.Notation

  object :budget_month_transaction do
    field :id, non_null(:id)
    field :planned_transaction_id, :id
    field :description, non_null(:string)
    field :amount, non_null(:integer)
    field :type, non_null(:financial_type)
    field :category_id, non_null(:id)
    field :payment_method, non_null(:payment_method)
    field :occurred_on, non_null(:date)
    field :origin, non_null(:transaction_origin)
    field :status, non_null(:transaction_status)
    field :notes, :string
  end

  object :budget_month do
    field :id, non_null(:id)
    field :reference_year, non_null(:integer)
    field :reference_month, non_null(:integer)
    field :starts_on, non_null(:date)
    field :ends_on, non_null(:date)
    field :initialized_at, :string
    field :transactions, non_null(list_of(non_null(:budget_month_transaction)))
  end

  object :budget_month_summary do
    field :reference_year, non_null(:integer)
    field :reference_month, non_null(:integer)
    field :income_expected, non_null(:integer)
    field :income_confirmed, non_null(:integer)
    field :expense_expected, non_null(:integer)
    field :expense_confirmed, non_null(:integer)
    field :total_expected, non_null(:integer)
    field :total_confirmed, non_null(:integer)
    field :transaction_count, non_null(:integer)
  end

  input_object :add_manual_transaction_input do
    field :description, non_null(:string)
    field :amount, non_null(:integer)
    field :type, non_null(:financial_type)
    field :category_id, non_null(:id)
    field :payment_method, non_null(:payment_method)
    field :occurred_on, non_null(:date)
    field :status, :transaction_status
    field :notes, :string
  end
end
