import Button from "../Button";
import StatusTag from "../StatusTag";
import type { BudgetMonthTransaction } from "../../api/types/budget-month";
import formatCurrency from "../../utils/formatCurrency";

type Props = {
  open: boolean;
  transaction: BudgetMonthTransaction | null;
  onClose: () => void;
};

export default function TransactionDetailsDrawer({
  open,
  transaction,
  onClose,
}: Props) {
  if (!open || !transaction) return null;

  const displayAmount = transaction.actualAmount ?? transaction.expectedAmount;
  const originLabel = transaction.origin === "PLANNED" ? "Planejado" : "Avulso";

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar detalhes"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-primary-border bg-card-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              Detalhes da transação
            </h2>
            <p className="mt-1 text-xs text-secondary-text">
              Informações completas do lançamento selecionado.
            </p>
          </div>

          <div className="flex flex-1 flex-col px-6 py-5">
            <div className="flex flex-col gap-8">
              <InfoRow label="Descrição" value={transaction.description} />
              <InfoRow label="Valor" value={formatCurrency(displayAmount)} />
              <InfoRow
                label="Status"
                value={
                  <StatusTag
                    status={transaction.status === "PAID" ? "PAID" : "PENDING"}
                  />
                }
              />
              <InfoRow
                label="Tipo"
                value={transaction.type === "INCOME" ? "Receita" : "Despesa"}
              />
              <InfoRow
                label="Categoria"
                value={
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-3 w-3 shrink-0 rounded-full border border-black/10"
                      style={{
                        backgroundColor: transaction.categoryColor ?? "#cbd5e1",
                      }}
                      aria-label="Cor da categoria"
                      title="Cor da categoria"
                    />
                    <span className="text-sm font-medium text-primary-text">
                      {transaction.categoryName ?? "—"}
                    </span>
                  </div>
                }
              />
              <InfoRow
                label="Data"
                value={formatDate(transaction.occurredOn)}
              />
              <InfoRow label="Origem" value={originLabel} />
              <InfoRow label="Pagamento" value={transaction.paymentMethod} />
              <InfoRow label="Observações" value={transaction.notes || "—"} />
            </div>

            <div className="mt-auto pt-4">
              <Button variant="primary" type="button" onClick={onClose}>
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-secondary-text">{label}</span>
      <span className="text-right text-sm font-medium text-primary-text">
        {value}
      </span>
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}
