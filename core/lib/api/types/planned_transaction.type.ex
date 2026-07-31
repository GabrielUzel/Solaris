defmodule SolarisCoreWeb.Api.Types.PlannedTransactionTypes do
  use Absinthe.Schema.Notation

  object :planned_transaction do
    field :id, non_null(:id)
    field :description, non_null(:string)
    field :amount, non_null(:integer)
    field :type, non_null(:financial_type)
    field :category_id, non_null(:id)
    field :payment_method, non_null(:payment_method)
    field :day_of_month, non_null(:integer)
    field :starts_on, non_null(:date)
    field :active, non_null(:boolean)
    field :notes, :string
  end

  input_object :create_planned_transaction_input do
    field :description, non_null(:string)
    field :amount, non_null(:integer)
    field :type, non_null(:financial_type)
    field :category_id, non_null(:id)
    field :payment_method, non_null(:payment_method)
    field :day_of_month, non_null(:integer)
    field :starts_on, non_null(:date)
    field :notes, :string
  end

  input_object :update_planned_transaction_input do
    field :description, :string
    field :amount, :integer
    field :category_id, :id
    field :payment_method, :payment_method
    field :day_of_month, :integer
    field :starts_on, :date
    field :notes, :string
  end
end
