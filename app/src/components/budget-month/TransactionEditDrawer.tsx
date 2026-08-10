import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { useListCategories } from "../../hooks/category";
import { useUpdateManualTransaction } from "../../hooks/budget-month";
import {
  useGetPlannedTransactionById,
  useUpdatePlannedTransaction,
} from "../../hooks/planned-transaction";
import type { FinancialType, PaymentMethod } from "../../api/types/common";
import type { BudgetMonthTransaction } from "../../api/types/budget-month";

type Props = {
  open: boolean;
  transaction: BudgetMonthTransaction | null;
  budgetMonthId: string | null;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
};

export default function TransactionEditDrawer({
  open,
  transaction,
  budgetMonthId,
  onClose,
  onSuccess,
}: Props) {
  const isManual = transaction?.origin === "MANUAL";

  const { data: categoriesData } = useListCategories();
  const [updateManualTransaction, { loading: updatingManual }] =
    useUpdateManualTransaction();
  const [updatePlannedTransaction, { loading: updatingPlanned }] =
    useUpdatePlannedTransaction();

  const { data: plannedData } = useGetPlannedTransactionById(
    !isManual ? (transaction?.plannedTransactionId ?? undefined) : undefined,
  );
  const plannedTransaction = plannedData?.getPlannedTransactionById ?? null;

  const categories = categoriesData?.listCategories ?? [];
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<FinancialType>("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [occurredOn, setOccurredOn] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [notes, setNotes] = useState("");

  const loading = updatingManual || updatingPlanned;

  useEffect(() => {
    if (!open || !transaction) return;

    if (isManual) {
      setDescription(transaction.description);
      setAmount((transaction.expectedAmount / 100).toFixed(2));
      setType(transaction.type);
      setCategoryId(transaction.categoryId);
      setPaymentMethod(transaction.paymentMethod);
      setOccurredOn(transaction.occurredOn.slice(0, 10));
      setNotes(transaction.notes ?? "");
    } else if (plannedTransaction) {
      setDescription(plannedTransaction.description);
      setAmount((plannedTransaction.amount / 100).toFixed(2));
      setType(plannedTransaction.type);
      setCategoryId(plannedTransaction.categoryId);
      setPaymentMethod(plannedTransaction.paymentMethod);
      setDayOfMonth(String(plannedTransaction.dayOfMonth));
      setNotes(plannedTransaction.notes ?? "");
    }
  }, [open, transaction, isManual, plannedTransaction]);

  if (!open || !transaction) return null;

  const subtitle = isManual
    ? "Lançamento avulso do mês."
    : "Editar o modelo do lançamento planejado.";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!transaction) return;

    const amountInCents = Math.round(Number(amount.replace(",", ".")) * 100);

    if (isManual) {
      if (!budgetMonthId) return;

      await updateManualTransaction({
        variables: {
          budgetMonthId,
          transactionId: transaction.id,
          input: {
            description,
            expectedAmount: amountInCents,
            type,
            categoryId,
            paymentMethod,
            occurredOn,
            notes: notes || undefined,
          },
        },
      });
    } else {
      if (!transaction.plannedTransactionId) return;

      await updatePlannedTransaction({
        variables: {
          id: transaction.plannedTransactionId,
          input: {
            description,
            amount: amountInCents,
            categoryId,
            paymentMethod,
            dayOfMonth: Number(dayOfMonth),
            notes: notes || undefined,
          },
        },
      });
    }

    await onSuccess?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar edição"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-primary-border bg-card-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="border-b border-primary-border px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              Editar lançamento
            </h2>
            <p className="mt-1 text-xs text-secondary-text">{subtitle}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
          >
            <Field label="Descrição">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />
            </Field>

            <Field label={isManual ? "Valor previsto" : "Valor"}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />
            </Field>

            {isManual && (
              <Field label="Tipo">
                <Dropdown
                  label="Selecione o tipo"
                  value={type}
                  onChange={(value) => setType(value as FinancialType)}
                  options={[
                    { label: "Despesa", value: "EXPENSE" },
                    { label: "Receita", value: "INCOME" },
                  ]}
                />
              </Field>
            )}

            <Field label="Categoria">
              <Dropdown
                label="Selecione a categoria"
                value={categoryId}
                onChange={setCategoryId}
                options={categoryOptions}
              />
            </Field>

            <Field label="Forma de pagamento">
              <Dropdown
                label="Selecione a forma de pagamento"
                value={paymentMethod}
                onChange={(value) => setPaymentMethod(value as PaymentMethod)}
                options={[
                  { label: "Pix", value: "PIX" },
                  { label: "Transferência", value: "BANK_TRANSFER" },
                  { label: "Boleto", value: "BOLETO" },
                  { label: "Cartão de crédito", value: "CREDIT_CARD" },
                  { label: "Cartão de débito", value: "DEBIT_CARD" },
                ]}
              />
            </Field>

            {isManual ? (
              <Field label="Data da ocorrência">
                <input
                  type="date"
                  value={occurredOn}
                  onChange={(e) => setOccurredOn(e.target.value)}
                  className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
                />
              </Field>
            ) : (
              <Field label="Dia do mês">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
                />
              </Field>
            )}

            <Field label="Observações">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />
            </Field>

            <div className="mt-auto flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                Salvar alterações
              </Button>
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-secondary-text">{label}</label>
      {children}
    </div>
  );
}
