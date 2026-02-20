defmodule SolarisCoreWeb.Api.Types.CategoryTypes do
  use Absinthe.Schema.Notation

  # ============================================================================
  # MUTATION TYPES
  # ============================================================================

  object :category do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:type, non_null(:transaction_type))
    field(:color, :string)
    field(:inserted_at, :string)
    field(:updated_at, :string)
  end

  input_object :create_category_input do
    field(:id, non_null(:string))
    field(:name, non_null(:string))
    field(:type, non_null(:transaction_type))
    field(:color, :string)
  end

  input_object :update_category_input do
    field(:name, :string)
    field(:type, :transaction_type)
    field(:color, :string)
  end

  # ============================================================================
  # QUERY TYPES
  # ============================================================================

  object :category_summary do
    field(:category, non_null(:string))
    field(:total, non_null(:integer))
    field(:count, non_null(:integer))
    field(:color, :string)
  end

  object :category_with_transactions do
    field(:category, non_null(:category))
    field(:transactions, non_null(list_of(non_null(:transaction_detail))))
    field(:total, non_null(:integer))
    field(:count, non_null(:integer))
  end
end
