defmodule SolarisCore.Finance.Domain.CreditCard.InvoiceEntry do
  defstruct [
    :transaction_id,
    :budget_month_id,
    :description,
    :category_id,
    :category_name,
    :category_color,
    :amount,
    :expected_amount,
    :actual_amount,
    :status,
    :occurred_on,
    :installment_number,
    :installments_total,
    :installment_group_id,
    :notes
  ]
end
