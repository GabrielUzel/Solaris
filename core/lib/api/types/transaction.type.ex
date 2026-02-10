defmodule SolarisCoreWeb.Api.Types.TransactionTypes do
  use Absinthe.Schema.Notation

  # ============================================================================
  # MUTATION TYPES
  # ============================================================================

  @desc "Recurrence configuration for a transaction"
  object :recurrence do
    field(:frequency, non_null(:recurrence_frequency))
    field(:interval, :integer, description: "Interval between recurrences")
    field(:day_of_month, :integer, description: "Specific day of month")
    field(:end_date, :string, description: "End date in ISO8601 format")
  end

  @desc "A transaction entity"
  object :transaction do
    field(:id, non_null(:id))
    field(:account_id, non_null(:string))
    field(:amount, non_null(:integer), description: "Amount in cents")
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string), description: "Date in ISO8601 format")
    field(:description, non_null(:string))
    field(:category_id, non_null(:string))
    field(:recurrence, :recurrence)
    field(:inserted_at, :string)
    field(:updated_at, :string)
  end

  @desc "Input for recurrence configuration"
  input_object :recurrence_input do
    field(:frequency, non_null(:recurrence_frequency), description: "Recurrence frequency")
    field(:interval, :integer, description: "Interval between recurrences")
    field(:day_of_month, :integer, description: "Day of month for monthly recurrence")
    field(:end_date, :string, description: "End date in ISO8601 format")
  end

  @desc "Input for creating a new transaction"
  input_object :create_transaction_input do
    field(:account_id, non_null(:string), description: "Account ID")
    field(:amount, non_null(:integer), description: "Amount in cents")
    field(:type, non_null(:transaction_type), description: "Transaction type (income/expense)")
    field(:date, non_null(:string), description: "Transaction date in ISO8601 format")
    field(:description, non_null(:string), description: "Transaction description")
    field(:category_id, non_null(:string), description: "Category ID")
    field(:recurrence, :recurrence_input, description: "Optional recurrence configuration")
  end

  @desc "Input for updating an existing transaction"
  input_object :update_transaction_input do
    field(:account_id, :string, description: "Account ID")
    field(:amount, :integer, description: "Amount in cents")
    field(:type, :transaction_type, description: "Transaction type (income/expense)")
    field(:date, :string, description: "Transaction date in ISO8601 format")
    field(:description, :string, description: "Transaction description")
    field(:category_id, :string, description: "Category ID")
    field(:recurrence, :recurrence_input, description: "Recurrence configuration")
  end

  # ============================================================================
  # QUERY TYPES - Detail Objects
  # ============================================================================

  @desc "Transaction with enriched category and account information"
  object :transaction_detail do
    field(:id, non_null(:id))
    field(:amount, non_null(:integer), description: "Amount in cents")
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string), description: "Date in ISO8601 format")
    field(:description, non_null(:string))
    field(:category_name, non_null(:string))
    field(:category_color, :string)
    field(:account_name, non_null(:string))
    field(:recurrence_frequency, non_null(:recurrence_frequency))
    field(:is_recurring, :boolean)
  end

  @desc "Transaction with full recurrence details"
  object :transaction_with_recurrence do
    field(:id, non_null(:id))
    field(:amount, non_null(:integer), description: "Amount in cents")
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string), description: "Date in ISO8601 format")
    field(:description, non_null(:string))
    field(:category_name, non_null(:string))
    field(:account_name, non_null(:string))
    field(:recurrence, non_null(:recurrence))
  end

  @desc "Simplified transaction for month projections"
  object :month_transaction do
    field(:id, non_null(:id))
    field(:amount, non_null(:integer), description: "Amount in cents")
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:string), description: "Projected date in ISO8601 format")
    field(:description, non_null(:string))
    field(:category_name, non_null(:string))
    field(:category_color, :string)
  end

  # ============================================================================
  # QUERY TYPES - Aggregation Results
  # ============================================================================

  @desc "Period representation (year and month)"
  object :period do
    field(:year, non_null(:integer))
    field(:month, non_null(:integer))
  end

  @desc "Date range representation"
  object :date_range do
    field(:start, non_null(:string), description: "Start date in ISO8601 format")
    field(:end, non_null(:string), description: "End date in ISO8601 format")
  end

  @desc "Monthly summary with aggregated financial data"
  object :month_summary do
    field(:period, non_null(:period))
    field(:total_income, non_null(:integer), description: "Total income in cents")
    field(:total_expense, non_null(:integer), description: "Total expense in cents")
    field(:balance, non_null(:integer), description: "Net balance (income - expense)")
    field(:transactions_count, non_null(:integer))
    field(:by_category, non_null(list_of(non_null(:category_summary))))
  end

  @desc "Transactions filtered by date range with aggregations"
  object :date_range_result do
    field(:transactions, non_null(list_of(non_null(:transaction_detail))))
    field(:period, non_null(:date_range))
    field(:total_income, non_null(:integer), description: "Total income in cents")
    field(:total_expense, non_null(:integer), description: "Total expense in cents")
    field(:balance, non_null(:integer), description: "Net balance")
    field(:count, non_null(:integer), description: "Number of transactions")
  end

  @desc "Transactions grouped by recurrence frequency"
  object :recurrence_result do
    field(:frequency, non_null(:recurrence_frequency))
    field(:transactions, non_null(list_of(non_null(:transaction_with_recurrence))))
    field(:count, non_null(:integer), description: "Number of transactions")
  end

  @desc "Transactions filtered by type with aggregations"
  object :type_result do
    field(:transactions, non_null(list_of(non_null(:transaction_detail))))
    field(:total, non_null(:integer), description: "Total amount in cents")
    field(:count, non_null(:integer), description: "Number of transactions")
  end
end
