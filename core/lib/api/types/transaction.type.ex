defmodule SolarisCoreWeb.Api.Types.TransactionTypes do
  use Absinthe.Schema.Notation

  # ============================================================================
  # MUTATION TYPES
  # ============================================================================

  object :recurrence do
    field(:frequency, non_null(:recurrence_frequency))
    field(:interval, :integer)
    field(:day_of_month, :integer)
    field(:end_date, :string)
  end

  object :transaction do
    field(:id, non_null(:id))
    field(:account_id, non_null(:string))
    field(:amount, non_null(:integer))
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string))
    field(:description, non_null(:string))
    field(:category_id, non_null(:string))
    field(:recurrence, :recurrence)
    field(:inserted_at, :string)
    field(:updated_at, :string)
  end

  input_object :recurrence_input do
    field(:frequency, non_null(:recurrence_frequency))
    field(:interval, :integer)
    field(:day_of_month, :integer)
    field(:end_date, :string)
  end

  input_object :create_transaction_input do
    field(:account_id, non_null(:string))
    field(:amount, non_null(:integer))
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string))
    field(:description, non_null(:string))
    field(:category_id, non_null(:string))
    field(:recurrence, :recurrence_input)
  end

  input_object :update_transaction_input do
    field(:account_id, :string)
    field(:amount, :integer)
    field(:type, :transaction_type)
    field(:date, :string)
    field(:description, :string)
    field(:category_id, :string)
    field(:recurrence, :recurrence_input)
  end

  # ============================================================================
  # QUERY TYPES - Detail Objects
  # ============================================================================

  object :transaction_detail do
    field(:id, non_null(:id))
    field(:amount, non_null(:integer))
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string))
    field(:description, non_null(:string))
    field(:category_name, non_null(:string))
    field(:category_color, :string)
    field(:account_name, non_null(:string))
    field(:recurrence_frequency, non_null(:recurrence_frequency))
    field(:is_recurring, :boolean)
  end

  object :transaction_with_recurrence do
    field(:id, non_null(:id))
    field(:amount, non_null(:integer))
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string))
    field(:description, non_null(:string))
    field(:category_name, non_null(:string))
    field(:account_name, non_null(:string))
    field(:recurrence, non_null(:recurrence))
  end

  object :month_transaction do
    field(:id, non_null(:id))
    field(:amount, non_null(:integer))
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string))
    field(:description, non_null(:string))
    field(:category_name, non_null(:string))
    field(:category_color, :string)
  end

  # ============================================================================
  # QUERY TYPES - Aggregation Results
  # ============================================================================

  object :period do
    field(:year, non_null(:integer))
    field(:month, non_null(:integer))
  end

  object :date_range do
    field(:start, non_null(:string))
    field(:end, non_null(:string))
  end

  object :month_summary do
    field(:period, non_null(:period))
    field(:total_income, non_null(:integer))
    field(:total_expense, non_null(:integer))
    field(:balance, non_null(:integer))
    field(:transactions_count, non_null(:integer))
    field(:by_category, non_null(list_of(non_null(:category_summary))))
  end

  object :date_range_result do
    field(:transactions, non_null(list_of(non_null(:transaction_detail))))
    field(:period, non_null(:date_range))
    field(:total_income, non_null(:integer))
    field(:total_expense, non_null(:integer))
    field(:balance, non_null(:integer))
    field(:count, non_null(:integer))
  end

  object :recurrence_result do
    field(:frequency, non_null(:recurrence_frequency))
    field(:transactions, non_null(list_of(non_null(:transaction_with_recurrence))))
    field(:count, non_null(:integer))
  end

  object :type_result do
    field(:transactions, non_null(list_of(non_null(:transaction_detail))))
    field(:total, non_null(:integer))
    field(:count, non_null(:integer))
  end
end
