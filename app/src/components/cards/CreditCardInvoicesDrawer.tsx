import { useEffect } from "react";
import Button from "../Button";
import Spinner from "../Spinner";
import StatusTag from "../StatusTag";
import { useGetCreditCardInvoices } from "../../hooks/credit-card";
import type {
  CreditCard,
  CreditCardInvoice,
  CreditCardInvoiceEntry,
  CreditCardInvoiceStatus,
} from "../../api/types/credit-card";
import formatCurrency from "../../utils/formatCurrency";

type Props = {
  open: boolean;
  onClose: () => void;
  card: CreditCard | null;
  onEditTransaction: (entry: CreditCardInvoiceEntry) => void;
  refreshKey?: number;
};

export default function CreditCardInvoicesDrawer({
  open,
  onClose,
  card,
  onEditTransaction,
  refreshKey = 0,
}: Props) {
  const { data, loading, error, refetch } = useGetCreditCardInvoices(
    card?.id,
  );

  useEffect(() => {
    if (!open || !card?.id) return;
    refetch();
  }, [refreshKey, open, card?.id, refetch]);

  if (!open || !card) return null;

  const currentInvoice = data?.getCreditCardInvoices.currentInvoice ?? null;
  const futureInvoices = data?.getCreditCardInvoices.futureInvoices ?? [];
  const isEmpty = !currentInvoice && futureInvoices.length === 0;

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 animate-overlay-fade bg-black/50"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-xl animate-drawer-slide border-l border-primary-border bg-card-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-primary-border px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              Faturas · {card.name}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-secondary-text hover:text-primary-text"
            >
              Fechar
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
            {loading ? (
              <Spinner />
            ) : error ? (
              <div className="flex flex-col items-start gap-2 rounded-xl border border-primary-border bg-card-background p-5 text-sm text-error shadow-default">
                <span>Erro ao carregar as faturas.</span>
                <Button variant="secondary" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-secondary-text">
                <p>Nenhuma fatura com lançamentos para este cartão.</p>
              </div>
            ) : (
              <>
                {card.hasOverdueInvoice && currentInvoice && (
                  <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
                    Atenção: esta fatura está em aberto e venceu em{" "}
                    {formatDate(currentInvoice.dueDate)}.
                  </div>
                )}

                {currentInvoice && (
                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-primary-text">
                      Fatura atual
                    </h3>
                    <InvoiceCard
                      invoice={currentInvoice}
                      onEditTransaction={onEditTransaction}
                    />
                  </section>
                )}

                {futureInvoices.length > 0 && (
                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-primary-text">
                      Próximas faturas
                    </h3>
                    {futureInvoices.map((invoice) => (
                      <InvoiceCard
                        key={`${invoice.periodStart}-${invoice.periodEnd}`}
                        invoice={invoice}
                        onEditTransaction={onEditTransaction}
                      />
                    ))}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceCard({
  invoice,
  onEditTransaction,
}: {
  invoice: CreditCardInvoice;
  onEditTransaction: (entry: CreditCardInvoiceEntry) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary-border bg-card-background p-4 shadow-default">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-primary-text">
          {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
        </span>
        <InvoiceStatusPill status={invoice.status} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-text">
        <span>Fechamento {formatDate(invoice.closingDate)}</span>
        <span>Vencimento {formatDate(invoice.dueDate)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary-background p-3">
        <TotalColumn label="Total" value={invoice.total} />
        <TotalColumn label="Pago" value={invoice.paidTotal} />
        <TotalColumn label="Em aberto" value={invoice.openTotal} />
      </div>

      <div className="flex flex-col divide-y divide-primary-border">
        {invoice.entries.map((entry) => (
          <div
            key={entry.transactionId}
            className="flex items-start justify-between gap-3 py-2"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: entry.categoryColor ?? "#9CA3AF",
                  }}
                />
                <span className="truncate text-xs text-secondary-text">
                  {entry.categoryName ?? "Sem categoria"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm text-primary-text">
                  {entry.description}
                </span>
                {entry.installmentsTotal != null &&
                  entry.installmentsTotal > 1 && (
                    <span className="rounded-full bg-secondary-background px-2 py-0.5 text-xs text-secondary-text">
                      Parcela {entry.installmentNumber}/{entry.installmentsTotal}
                    </span>
                  )}
              </div>
              <span className="text-xs text-secondary-text">
                {formatDate(entry.occurredOn)}
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-sm font-medium text-primary-text">
                {formatCurrency(entry.amount)}
              </span>
              <StatusTag
                status={entry.status === "EXPECTED" ? "PENDING" : entry.status}
              />
              {entry.budgetMonthId && (
                <button
                  type="button"
                  onClick={() => onEditTransaction(entry)}
                  className="text-xs text-primary hover:underline"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TotalColumn({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-secondary-text">{label}</span>
      <span className="text-sm font-semibold text-primary-text">
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function InvoiceStatusPill({ status }: { status: CreditCardInvoiceStatus }) {
  const config: Record<
    Exclude<CreditCardInvoiceStatus, "EMPTY">,
    { label: string; className: string }
  > = {
    OPEN: { label: "Em aberto", className: "bg-warning/10 text-warning" },
    CLOSED: { label: "Fechada", className: "bg-success/10 text-success" },
  };

  if (status === "EMPTY") return null;

  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}
