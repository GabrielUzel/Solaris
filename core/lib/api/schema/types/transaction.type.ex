defmodule SolarisCoreWeb.Schema.Types.TransactionTypes do
  use Absinthe.Schema.Notation

  enum :transaction_type do
    value(:income)
    value(:expense)
  end

  object :transaction do
    field(:id, :id)
    field(:amount, :integer)
    field(:type, :transaction_type)
    field(:date, :date)
    field(:description, :string)
    field(:category_id, :id)
  end

  input_object :create_transaction_input do
    field(:amount, non_null(:integer))
    field(:type, non_null(:transaction_type))
    field(:date, non_null(:date))
    field(:description, non_null(:string))
    field(:category_id, non_null(:id))
  end
end
