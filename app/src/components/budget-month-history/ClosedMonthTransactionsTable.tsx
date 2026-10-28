import type { BudgetMonthTransaction } from "../../api/types/budget-month";
import type { PaymentMethod } from "../../api/types/common";
import formatCurrency from "../../utils/formatCurrency";

type Props = {
  transactions: BudgetMonthTransaction[];
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  BANK_TRANSFER: "Transferência",
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
};

export default function ClosedMonthTransactionsTable({
  transactions,
}: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-primary-border">
      <table className="w-full table-fixed">
        <thead className="bg-secondary-background">
          <tr className="text-left text-xs font-medium text-secondary-text">
            <th className="w-[12%] px-3 py-2">Data</th>
            <th className="w-[28%] px-3 py-2">Descrição</th>
            <th className="w-[16%] px-3 py-2">Categoria</th>
            <th className="w-[10%] px-3 py-2">Tipo</th>
            <th className="w-[13%] px-3 py-2">Método</th>
            <th className="w-[13%] px-3 py-2 text-right">Valor</th>
            <th className="w-[8%] px-3 py-2">Origem</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-primary-border">
          {transactions.map((transaction) => {
            const displayAmount =
              transaction.actualAmount ?? transaction.expectedAmount;
            const dateLabel = formatDate(transaction.occurredOn);

            return (
              <tr key={transaction.id} className="bg-card-background">
                <td className="px-3 py-2 align-middle text-sm text-secondary-text">
                  {dateLabel}
                </td>

                <td className="px-3 py-2 align-middle">
                  <span className="block truncate text-sm font-medium text-primary-text">
                    {transaction.description}
                  </span>
                </td>

                <td className="px-3 py-2 align-middle text-sm text-secondary-text">
                  {transaction.categoryName ?? "—"}
                </td>

                <td className="px-3 py-2 align-middle text-sm text-secondary-text">
                  {transaction.type === "INCOME" ? "Receita" : "Despesa"}
                </td>

                <td className="px-3 py-2 align-middle text-sm text-secondary-text">
                  {PAYMENT_METHOD_LABELS[transaction.paymentMethod] ??
                    transaction.paymentMethod}
                </td>

                <td
                  className={`px-3 py-2 align-middle text-right text-sm font-semibold ${
                    transaction.type === "INCOME" ? "text-success" : "text-error"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}{" "}
                  {formatCurrency(displayAmount)}
                </td>

                <td className="px-3 py-2 align-middle text-sm text-secondary-text">
                  {transaction.origin === "PLANNED" ? "Planejado" : "Manual"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}
