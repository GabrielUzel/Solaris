defmodule SolarisCoreWeb.Api.Types.BudgetMonthTypes do
  use Absinthe.Schema.Notation

  object :budget_month_transaction do
    field(:id, non_null(:id))
    field(:planned_transaction_id, :id)
    field(:description, non_null(:string))
    field(:expected_amount, non_null(:integer))
    field(:actual_amount, :integer)
    field(:type, non_null(:financial_type))
    field(:category_id, non_null(:id))
    field(:category_name, :string)
    field(:category_color, :string)
    field(:category_type, :financial_type)
    field(:payment_method, non_null(:payment_method))
    field(:occurred_on, non_null(:date))
    field(:origin, non_null(:transaction_origin))
    field(:status, non_null(:transaction_status))
    field(:notes, :string)
  end

  object :budget_month do
    field(:id, non_null(:id))
    field(:reference_year, non_null(:integer))
    field(:reference_month, non_null(:integer))
    field(:starts_on, non_null(:date))
    field(:ends_on, non_null(:date))
    field(:initialized_at, :string)
    field(:transactions, non_null(list_of(non_null(:budget_month_transaction))))
  end

  object :budget_month_summary do
    field(:reference_year, non_null(:integer))
    field(:reference_month, non_null(:integer))
    field(:income_expected, non_null(:integer))
    field(:income_paid, non_null(:integer))
    field(:expense_expected, non_null(:integer))
    field(:expense_paid, non_null(:integer))
    field(:total_expected, non_null(:integer))
    field(:total_paid, non_null(:integer))
    field(:transaction_count, non_null(:integer))
    field(:is_closed, non_null(:boolean))
    field(:pending_expense_count, non_null(:integer))
  end

  object :budget_month_preview do
    field(:reference_year, non_null(:integer))
    field(:reference_month, non_null(:integer))
    field(:exists_as_budget_month, non_null(:boolean))
    field(:transactions, non_null(list_of(non_null(:planned_transaction))))
    field(:summary, non_null(:budget_month_summary))
  end

  input_object :create_manual_transaction_input do
    field(:description, non_null(:string))
    field(:expected_amount, :integer)
    field(:actual_amount, :integer)
    field(:type, non_null(:financial_type))
    field(:category_id, non_null(:id))
    field(:payment_method, non_null(:payment_method))
    field(:occurred_on, non_null(:date))
    field(:status, :transaction_status)
    field(:notes, :string)
  end

  input_object :update_manual_transaction_input do
    field(:description, :string)
    field(:expected_amount, :integer)
    field(:actual_amount, :integer)
    field(:type, :financial_type)
    field(:category_id, :id)
    field(:payment_method, :payment_method)
    field(:occurred_on, :date)
    field(:status, :transaction_status)
    field(:notes, :string)
  end

  input_object :pay_transaction_input do
    field(:actual_amount, :integer)
  end

  input_object :budget_month_transaction_filters do
    field(:category_id, :id)
    field(:name, :string)
    field(:origin, :transaction_origin)
    field(:category_type, :financial_type)
    field(:start_date, :date)
    field(:end_date, :date)
  end
end
