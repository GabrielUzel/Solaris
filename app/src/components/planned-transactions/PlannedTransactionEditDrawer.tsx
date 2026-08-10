import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { useListCategories } from "../../hooks/category";
import { useUpdatePlannedTransaction } from "../../hooks/planned-transaction";
import type { PaymentMethod } from "../../api/types/common";
import type { PlannedTransaction } from "../../api/types/planned-transaction";

type Props = {
  open: boolean;
  transaction: PlannedTransaction | null;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
};

export default function PlannedTransactionEditDrawer({
  open,
  transaction,
  onClose,
  onSuccess,
}: Props) {
  const { data: categoriesData } = useListCategories();
  const [updatePlannedTransaction, { loading }] = useUpdatePlannedTransaction();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [startsOn, setStartsOn] = useState(getToday());
  const [notes, setNotes] = useState("");

  const categories = categoriesData?.listCategories ?? [];
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  useEffect(() => {
    if (!open || !transaction) return;
    setDescription(transaction.description ?? "");
    setAmount(formatAmountFromCents(transaction.amount));
    setCategoryId(transaction.categoryId ?? "");
    setPaymentMethod(transaction.paymentMethod);
    setDayOfMonth(String(transaction.dayOfMonth ?? 1));
    setStartsOn(transaction.startsOn?.slice(0, 10) ?? getToday());
    setNotes(transaction.notes ?? "");
  }, [open, transaction]);

  if (!open || !transaction) return null;

  const typeLabel = transaction.type === "INCOME" ? "Receita" : "Despesa";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!transaction) return;

    const amountInCents = Math.round(Number(amount.replace(",", ".")) * 100);

    await updatePlannedTransaction({
      variables: {
        id: transaction.id,
        input: {
          description,
          amount: amountInCents,
          categoryId,
          paymentMethod,
          dayOfMonth: Number(dayOfMonth),
          startsOn,
          notes: notes || null,
        },
      },
    });

    await onSuccess?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-primary-border bg-card-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="border-b border-primary-border px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              Editar lançamento planejado
            </h2>
            <p className="mt-1 text-xs text-secondary-text">
              Atualize os dados do lançamento recorrente.
            </p>
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

            <Field label="Valor">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />
            </Field>

            <Field label="Tipo">
              <div className="rounded-lg border border-primary-border bg-secondary-background px-3 py-2 text-sm text-secondary-text">
                {typeLabel}
              </div>
              <span className="text-[11px] text-secondary-text">
                O tipo não pode ser alterado após a criação.
              </span>
            </Field>

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

            <Field label="Início da recorrência">
              <input
                type="date"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />
            </Field>

            <Field label="Observações">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
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

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatAmountFromCents(cents: number) {
  return (cents / 100).toFixed(2);
}
