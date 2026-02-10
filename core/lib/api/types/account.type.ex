defmodule SolarisCoreWeb.Api.Types.AccountTypes do
  use Absinthe.Schema.Notation

  # ============================================================================
  # MUTATION TYPES
  # ============================================================================

  @desc "An account entity"
  object :account do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:type, non_null(:account_type))
    field(:inserted_at, :string)
    field(:updated_at, :string)
  end

  @desc "Input for creating a new account"
  input_object :create_account_input do
    field(:name, non_null(:string), description: "Account name")
    field(:type, non_null(:account_type), description: "Account type")
  end

  @desc "Input for updating an existing account"
  input_object :update_account_input do
    field(:name, :string, description: "Account name")
    field(:type, :account_type, description: "Account type")
  end

  # ============================================================================
  # QUERY TYPES
  # ============================================================================

  @desc "Account with calculated balance"
  object :account_balance do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:type, non_null(:account_type))
    field(:balance, non_null(:integer), description: "Current balance in cents")
    field(:inserted_at, :string)
  end

  @desc "Account with detailed balance information"
  object :account_with_details do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:type, non_null(:account_type))
    field(:balance, non_null(:integer), description: "Current balance in cents")
    field(:total_income, non_null(:integer), description: "Total income in cents")
    field(:total_expense, non_null(:integer), description: "Total expense in cents")
  end

  @desc "Total balance aggregated across all accounts"
  object :total_balance_result do
    field(:total_balance, non_null(:integer), description: "Sum of all account balances")
    field(:accounts, non_null(list_of(non_null(:account_with_details))))
    field(:accounts_count, non_null(:integer))
  end
end
