defmodule SolarisCoreWeb.Api.Types.AccountTypes do
  use Absinthe.Schema.Notation

  # ============================================================================
  # MUTATION TYPES
  # ============================================================================

  object :account do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:type, non_null(:account_type))
    field(:inserted_at, :string)
    field(:updated_at, :string)
  end

  input_object :create_account_input do
    field(:name, non_null(:string))
    field(:type, non_null(:account_type))
  end

  input_object :update_account_input do
    field(:name, :string)
    field(:type, :account_type)
  end

  # ============================================================================
  # QUERY TYPES
  # ============================================================================

  object :account_balance do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:type, non_null(:account_type))
    field(:balance, non_null(:integer))
    field(:inserted_at, :string)
  end

  object :account_with_details do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:type, non_null(:account_type))
    field(:balance, non_null(:integer))
    field(:total_income, non_null(:integer))
    field(:total_expense, non_null(:integer))
  end

  object :total_balance_result do
    field(:total_balance, non_null(:integer))
    field(:accounts, non_null(list_of(non_null(:account_with_details))))
    field(:accounts_count, non_null(:integer))
  end
end
