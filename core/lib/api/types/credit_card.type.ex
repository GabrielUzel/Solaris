defmodule SolarisCoreWeb.Api.Types.CreditCardTypes do
  use Absinthe.Schema.Notation

  enum :credit_card_invoice_status do
    value(:open)
    value(:closed)
    value(:empty)
  end

  object :credit_card do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:bank, non_null(:string))
    field(:closing_day, non_null(:integer))
    field(:due_day, non_null(:integer))
    field(:active, non_null(:boolean))
    field(:current_invoice, :credit_card_invoice)
    field(:has_overdue_invoice, :boolean)
  end

  object :credit_card_invoice_entry do
    field(:transaction_id, non_null(:id))
    field(:budget_month_id, :id)
    field(:description, non_null(:string))
    field(:category_id, :id)
    field(:category_name, :string)
    field(:category_color, :string)
    field(:amount, non_null(:integer))
    field(:expected_amount, :integer)
    field(:actual_amount, :integer)
    field(:status, non_null(:transaction_status))
    field(:occurred_on, non_null(:date))
    field(:installment_number, :integer)
    field(:installments_total, :integer)
    field(:installment_group_id, :id)
    field(:notes, :string)
  end

  object :credit_card_invoice do
    field(:credit_card_id, non_null(:id))
    field(:period_start, non_null(:date))
    field(:period_end, non_null(:date))
    field(:closing_date, non_null(:date))
    field(:due_date, non_null(:date))
    field(:total, non_null(:integer))
    field(:paid_total, non_null(:integer))
    field(:open_total, non_null(:integer))
    field(:status, non_null(:credit_card_invoice_status))
    field(:entries, non_null(list_of(non_null(:credit_card_invoice_entry))))
  end

  object :credit_card_invoices do
    field(:current_invoice, :credit_card_invoice)
    field(:future_invoices, non_null(list_of(non_null(:credit_card_invoice))))
  end

  input_object :create_credit_card_input do
    field(:name, non_null(:string))
    field(:bank, non_null(:string))
    field(:closing_day, non_null(:integer))
    field(:due_day, non_null(:integer))
  end

  input_object :update_credit_card_input do
    field(:name, :string)
    field(:bank, :string)
    field(:closing_day, :integer)
    field(:due_day, :integer)
  end

  input_object :create_credit_card_purchase_input do
    field(:description, non_null(:string))
    field(:total_amount, non_null(:integer))
    field(:category_id, non_null(:id))
    field(:credit_card_id, non_null(:id))
    field(:purchased_on, non_null(:date))
    field(:installments_total, :integer)
    field(:installment_amounts, list_of(non_null(:integer)))
    field(:confirm_amount_mismatch, :boolean)
    field(:notes, :string)
  end
end
