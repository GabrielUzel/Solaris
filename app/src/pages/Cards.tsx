import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import StatusTag from "../components/StatusTag";
import { useToast } from "../components/Toast";
import CreditCardVisual from "../components/cards/CreditCardVisual";
import CreditCardDrawer from "../components/cards/CreditCardDrawer";
import DeactivateCreditCardModal from "../components/cards/DeactivateCreditCardModal";
import DeactivatedCardsDrawer from "../components/cards/DeactivatedCardsDrawer";
import {
  useDeactivateCreditCard,
  useGetCreditCardInvoices,
  useListCreditCards,
} from "../hooks/credit-card";
import type {
  CreditCard,
  CreditCardInvoice,
  CreditCardInvoiceStatus,
} from "../api/types/credit-card";
import formatCurrency from "../utils/formatCurrency";

export default function Cards() {
  const { data, loading, error, refetch } = useListCreditCards();
  const [deactivateCreditCard, { loading: deactivating }] =
    useDeactivateCreditCard();
  const { showToast } = useToast();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null | "new">(
    null,
  );
  const [deactivatingCard, setDeactivatingCard] = useState<CreditCard | null>(
    null,
  );
  const [showDeactivatedDrawer, setShowDeactivatedDrawer] = useState(false);

  const cards = data?.listCreditCards ?? [];
  const activeCards = cards.filter((card) => card.active);
  const inactiveCards = cards.filter((card) => !card.active);
  const selectedCard = activeCards.find((c) => c.id === selectedCardId) ?? null;

  useEffect(() => {
    const actives = data?.listCreditCards?.filter((c) => c.active) ?? [];
    if (actives.length === 0) {
      setSelectedCardId(null);
      return;
    }
    if (
      selectedCardId === null ||
      !actives.some((c) => c.id === selectedCardId)
    ) {
      setSelectedCardId(actives[0].id);
    }
  }, [data, selectedCardId]);

  async function handleDeactivate() {
    if (!deactivatingCard) return;

    try {
      await deactivateCreditCard({
        variables: { id: deactivatingCard.id },
      });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível desativar o cartão.",
      );
      return;
    }

    setDeactivatingCard(null);
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-primary-text">Cartões</h1>
          <Button onClick={() => setEditingCard("new")}>Novo cartão</Button>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="rounded-xl border border-primary-border bg-card-background p-5 text-sm text-error shadow-default">
            Erro ao carregar os cartões.
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-secondary-text">
            <p>Nenhum cartão cadastrado.</p>
            <p>Cadastre um cartão para acompanhar as faturas.</p>
          </div>
        ) : (
          <>
            {activeCards.length > 0 && (
              <>
                <div className="flex flex-wrap gap-4">
                  {activeCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className={[
                        "w-82 rounded-2xl text-left transition-shadow",
                        selectedCardId === card.id
                          ? "shadow-card-selected"
                          : "",
                      ].join(" ")}
                      onClick={() => setSelectedCardId(card.id)}
                    >
                      <CreditCardVisual
                        name={card.name}
                        bank={card.bank}
                        closingDay={card.closingDay}
                        dueDay={card.dueDay}
                      />
                    </button>
                  ))}
                </div>

                {selectedCard && (
                  <SelectedCardInvoiceInfo
                    card={selectedCard}
                    onEdit={() => setEditingCard(selectedCard)}
                    onDeactivate={() => setDeactivatingCard(selectedCard)}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {!loading && !error && inactiveCards.length > 0 && (
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setShowDeactivatedDrawer(true)}
            className="text-sm text-secondary-text hover:text-primary-text hover:underline"
          >
            Ver cartões desativados ({inactiveCards.length})
          </button>
        </div>
      )}

      <CreditCardDrawer
        open={editingCard !== null}
        card={editingCard === "new" ? null : editingCard}
        onClose={() => setEditingCard(null)}
        onSuccess={() => {
          void refetch();
        }}
      />

      <DeactivateCreditCardModal
        open={deactivatingCard !== null}
        card={deactivatingCard}
        onClose={() => setDeactivatingCard(null)}
        onConfirm={handleDeactivate}
        loading={deactivating}
      />

      <DeactivatedCardsDrawer
        open={showDeactivatedDrawer}
        onClose={() => setShowDeactivatedDrawer(false)}
        cards={inactiveCards}
      />
    </div>
  );
}

function KebabMenu({
  onEdit,
  onDeactivate,
}: {
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-secondary-text hover:bg-hover-background hover:text-primary-text"
        aria-label="Opções do cartão"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-lg border border-primary-border bg-card-background shadow-2xl">
          <button
            type="button"
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-primary-text hover:bg-hover-background"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              onDeactivate();
              setOpen(false);
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-error hover:bg-hover-background"
          >
            Desativar
          </button>
        </div>
      )}
    </div>
  );
}

function SelectedCardInvoiceInfo({
  card,
  onEdit,
  onDeactivate,
}: {
  card: CreditCard;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const { data, loading, error, refetch } = useGetCreditCardInvoices(card.id);

  const currentInvoice = data?.getCreditCardInvoices.currentInvoice ?? null;
  const futureInvoices = data?.getCreditCardInvoices.futureInvoices ?? [];
  const isEmpty = !currentInvoice && futureInvoices.length === 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary-border bg-card-background p-5 shadow-default">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-primary-text">
          Faturas — {card.name}
        </span>
        <KebabMenu onEdit={onEdit} onDeactivate={onDeactivate} />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="flex flex-col items-start gap-2 text-sm text-error">
          <span>Erro ao carregar as faturas.</span>
          <Button variant="secondary" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : isEmpty ? (
        <span className="text-sm text-secondary-text">
          Nenhuma fatura com lançamentos para este cartão.
        </span>
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
              <InvoiceCard invoice={currentInvoice} />
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
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function InvoiceCard({ invoice }: { invoice: CreditCardInvoice }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary-border bg-card-background p-4 shadow-default">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-primary-text">
          {getMonthName(invoice.periodStart)} -{" "}
          {formatDate(invoice.periodStart)} a {formatDate(invoice.periodEnd)}
        </span>
        <InvoiceStatusPill status={invoice.status} />
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
            className="flex items-start justify-between gap-3 py-3"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm font-medium text-primary-text">
                {entry.description}
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: entry.categoryColor ?? "#9CA3AF",
                    }}
                  />
                  <span className="text-xs text-secondary-text">
                    {entry.categoryName ?? "Sem categoria"}
                  </span>
                </div>
                <span className="text-xs text-secondary-text">
                  {formatDate(entry.occurredOn)}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-sm font-semibold text-primary-text">
                {formatCurrency(entry.amount)}
              </span>
              <StatusTag
                status={entry.status === "EXPECTED" ? "PENDING" : entry.status}
              />
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

function getMonthName(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const name = date.toLocaleDateString("pt-BR", { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}
