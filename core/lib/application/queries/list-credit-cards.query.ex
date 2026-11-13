defmodule SolarisCore.Application.Queries.ListCreditCards do
  import Ecto.Query

  alias SolarisCore.Repo
  alias SolarisCore.Finance.Domain.CreditCard.Invoice
  alias SolarisCore.Infrastructure.Repositories.CreditCardRepo
  alias SolarisCore.Infrastructure.Schemas.CategorySchema
  alias SolarisCore.Infrastructure.Schemas.TransactionSchema

  @spec execute() :: {:ok, [map()]}
  def execute do
    cards = CreditCardRepo.list_all()
    rows_by_card = rows_by_card_id(list_credit_card_rows())
    today = Date.utc_today()

    credit_cards =
      Enum.map(cards, fn card ->
        invoices = Invoice.build(card, Map.get(rows_by_card, card.id, []))
        current_invoice = Invoice.current(invoices)

        %{
          id: card.id,
          name: card.name,
          bank: card.bank,
          closing_day: card.closing_day,
          due_day: card.due_day,
          active: card.active,
          current_invoice: current_invoice,
          has_overdue_invoice: current_invoice != nil and Invoice.overdue?(current_invoice, today)
        }
      end)

    {:ok, credit_cards}
  end

  defp rows_by_card_id(rows), do: Enum.group_by(rows, & &1.credit_card_id)

  defp list_credit_card_rows do
    from(t in TransactionSchema,
      left_join: c in CategorySchema,
      on: c.id == t.category_id,
      where:
        t.payment_method == :credit_card and t.type == :expense and t.status != :skipped and
          not is_nil(t.credit_card_id),
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
