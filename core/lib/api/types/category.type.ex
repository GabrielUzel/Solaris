defmodule SolarisCoreWeb.Api.Types.CategoryTypes do
  use Absinthe.Schema.Notation

  object :category do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :type, non_null(:financial_type)
    field :color, non_null(:string)
  end

  input_object :create_category_input do
    field :name, non_null(:string)
    field :type, non_null(:financial_type)
    field :color, non_null(:string)
  end

  input_object :update_category_input do
    field :name, :string
    field :type, :financial_type
    field :color, :string
  end
end
