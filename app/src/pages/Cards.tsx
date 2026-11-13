import { useState } from "react";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import { useToast } from "../components/Toast";
import CreditCardVisual from "../components/cards/CreditCardVisual";
import CreditCardDrawer from "../components/cards/CreditCardDrawer";
import CreditCardInvoicesDrawer from "../components/cards/CreditCardInvoicesDrawer";
import DeactivateCreditCardModal from "../components/cards/DeactivateCreditCardModal";
import TransactionEditDrawer from "../components/budget-month/TransactionEditDrawer";
import {
  useDeactivateCreditCard,
  useListCreditCards,
} from "../hooks/credit-card";
import type {
  CreditCard,
  CreditCardInvoiceEntry,
} from "../api/types/credit-card";
import type { BudgetMonthTransaction } from "../api/types/budget-month";
import { getBank } from "../utils/banks";
import formatCurrency from "../utils/formatCurrency";

type EditingEntry = {
  entry: CreditCardInvoiceEntry;
  card: CreditCard;
};

export default function Cards() {
  const { data, loading, error, refetch } = useListCreditCards();
  const [deactivateCreditCard, { loading: deactivating }] =
    useDeactivateCreditCard();
  const { showToast } = useToast();

  const [selectedCardForInvoices, setSelectedCardForInvoices] =
    useState<CreditCard | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null | "new">(
    null,
  );
  const [deactivatingCard, setDeactivatingCard] = useState<CreditCard | null>(
    null,
  );
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const cards = data?.listCreditCards ?? [];
  const activeCards = cards.filter((card) => card.active);
  const inactiveCards = cards.filter((card) => !card.active);

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

  function handleEditEntry(entry: CreditCardInvoiceEntry) {
    if (!selectedCardForInvoices || !entry.budgetMonthId) return;

    setEditingEntry({ entry, card: selectedCardForInvoices });
  }

  const editingTransaction = editingEntry
    ? toBudgetMonthTransaction(editingEntry)
    : null;

  return (
    <div className="flex flex-col gap-6">
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
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {activeCards.map((card) => {
                const invoice = card.currentInvoice ?? null;

                return (
                  <div key={card.id} className="flex flex-col gap-3">
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => setSelectedCardForInvoices(card)}
                    >
                      <CreditCardVisual
                        name={card.name}
                        bank={card.bank}
                        closingDay={card.closingDay}
                        dueDay={card.dueDay}
                      />
                    </button>

                    <div className="flex flex-col gap-2 rounded-xl border border-primary-border bg-card-background p-4">
                      {invoice ? (
                        <>
                          <span className="text-xs text-secondary-text">
                            Fatura atual · vence{" "}
                            {formatDate(invoice.dueDate)}
                          </span>
                          <span className="font-semibold text-primary-text">
                            {formatCurrency(invoice.total)}
                          </span>
                          <span className="text-xs text-secondary-text">
                            {invoice.entries.length} lançamentos
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-secondary-text">
                          Sem fatura em aberto
                        </span>
                      )}

                      {card.hasOverdueInvoice && invoice && (
                        <span className="text-xs text-error">
                          Fatura em aberto vencida em{" "}
                          {formatDate(invoice.dueDate)}
                        </span>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCardForInvoices(card)}
                          className="text-xs text-primary hover:underline"
                        >
                          Faturas
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCard(card)}
                          className="text-xs text-primary hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeactivatingCard(card)}
                          className="text-xs text-error hover:underline"
                        >
                          Desativar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {inactiveCards.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-primary-text">
                Cartões desativados
              </h2>

              <div className="flex flex-col divide-y divide-primary-border rounded-xl border border-primary-border bg-card-background">
                {inactiveCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate text-sm text-primary-text">
                        {card.name}
                      </span>
                      <span className="text-xs text-secondary-text">
                        {getBank(card.bank).name}
                      </span>
                      <span className="rounded-full bg-secondary-text/10 px-2 py-0.5 text-[11px] font-medium text-secondary-text">
                        Desativado
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCardForInvoices(card)}
                      className="shrink-0 text-xs text-primary hover:underline"
                    >
                      Faturas
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
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

      <CreditCardInvoicesDrawer
        open={selectedCardForInvoices !== null}
        card={selectedCardForInvoices}
        onClose={() => setSelectedCardForInvoices(null)}
        onEditTransaction={handleEditEntry}
        refreshKey={refreshKey}
      />

      <TransactionEditDrawer
        open={editingEntry !== null}
        transaction={editingTransaction}
        budgetMonthId={editingEntry?.entry.budgetMonthId ?? null}
        onClose={() => setEditingEntry(null)}
        onSuccess={async () => {
          setRefreshKey((prev) => prev + 1);
          await refetch();
        }}
      />
    </div>
  );
}

function toBudgetMonthTransaction({
  entry,
  card,
}: EditingEntry): BudgetMonthTransaction {
  return {
    id: entry.transactionId,
    description: entry.description,
    expectedAmount: entry.expectedAmount ?? entry.amount,
    actualAmount: entry.actualAmount ?? null,
    type: "EXPENSE",
    categoryId: entry.categoryId ?? "",
    paymentMethod: "CREDIT_CARD",
    occurredOn: entry.occurredOn,
    origin: "MANUAL",
    status: entry.status,
    notes: entry.notes ?? null,
    creditCardId: card.id,
    installmentGroupId: entry.installmentGroupId ?? null,
    installmentNumber: entry.installmentNumber ?? null,
    installmentsTotal: entry.installmentsTotal ?? null,
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}
