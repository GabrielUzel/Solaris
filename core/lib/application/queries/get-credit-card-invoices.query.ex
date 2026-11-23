defmodule SolarisCore.Application.Queries.GetCreditCardInvoices do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Finance.Domain.CreditCard.Invoice
  alias SolarisCore.Infrastructure.Repositories.CreditCardRepo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema

  @spec execute(String.t()) :: {:ok, map()} | {:error, :credit_card_not_found}
  def execute(card_id) do
    with {:ok, card} <- fetch_credit_card(card_id) do
      invoices = Invoice.build(card, list_credit_card_rows(card.id))
      current_invoice = Invoice.current(invoices)
      future_invoices = Invoice.future(invoices, current_invoice)

      {:ok, %{current_invoice: current_invoice, future_invoices: future_invoices}}
    end
  end

  defp fetch_credit_card(id) do
    case CreditCardRepo.get(id) do
      {:error, :not_found} -> {:error, :credit_card_not_found}
      result -> result
    end
  end

  defp list_credit_card_rows(card_id) do
    from(t in TransactionSchema,
      left_join: c in CategorySchema,
      on: c.id == t.category_id,
      where:
        t.credit_card_id == ^card_id and t.payment_method == :credit_card and
          t.type == :expense and t.status != :skipped,
      select: %{
        id: t.id,
        budget_month_id: t.budget_month_id,
        credit_card_id: t.credit_card_id,
        description: t.description,
        category_id: t.category_id,
        category_name: c.name,
        category_color: c.color,
        expected_amount: t.expected_amount,
        actual_amount: t.actual_amount,
        status: t.status,
        occurred_on: t.occurred_on,
        installment_number: t.installment_number,
        installments_total: t.installments_total,
        installment_group_id: t.installment_group_id,
        notes: t.notes
      }
    )
    |> Repo.all()
  end
end
