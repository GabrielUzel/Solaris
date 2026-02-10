defmodule SolarisCoreWeb.Api.Types.CategoryTypes do
  use Absinthe.Schema.Notation

  # ============================================================================
  # MUTATION TYPES
  # ============================================================================

  @desc "A category entity"
  object :category do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:type, non_null(:transaction_type))
    field(:color, :string, description: "Color in hex format")
    field(:inserted_at, :string)
    field(:updated_at, :string)
  end

  @desc "Input for creating a new category"
  input_object :create_category_input do
    field(:id, non_null(:string), description: "Category ID")
    field(:name, non_null(:string), description: "Category name")
    field(:type, non_null(:transaction_type), description: "Category type (income/expense)")
    field(:color, :string, description: "Category color in hex format")
  end

  @desc "Input for updating an existing category"
  input_object :update_category_input do
    field(:name, :string, description: "Category name")
    field(:type, :transaction_type, description: "Category type (income/expense)")
    field(:color, :string, description: "Category color in hex format")
  end

  # ============================================================================
  # QUERY TYPES
  # ============================================================================

  @desc "Category summary with aggregated transaction data"
  object :category_summary do
    field(:category, non_null(:string), description: "Category name")
    field(:total, non_null(:integer), description: "Total amount in cents")
    field(:count, non_null(:integer), description: "Number of transactions")
    field(:color, :string, description: "Category color")
  end

  @desc "Category with all related transactions"
  object :category_with_transactions do
    field(:category, non_null(:category))
    field(:transactions, non_null(list_of(non_null(:transaction_detail))))
    field(:total, non_null(:integer), description: "Total amount in cents")
    field(:count, non_null(:integer), description: "Number of transactions")
  end
end
