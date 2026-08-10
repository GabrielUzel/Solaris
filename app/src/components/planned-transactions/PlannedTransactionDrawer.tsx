import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import CurrencyInput from "react-currency-input-field";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { useListCategories } from "../../hooks/category";
import { useCreatePlannedTransaction } from "../../hooks/planned-transaction";
import type { FinancialType, PaymentMethod } from "../../api/types/common";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
};

export default function PlannedTransactionDrawer({
  open,
  onClose,
  onSuccess,
}: Props) {
  const { data: categoriesData } = useListCategories();
  const [createPlannedTransaction, { loading }] = useCreatePlannedTransaction();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<FinancialType>("EXPENSE");
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
    if (!open) return;
    setDescription("");
    setAmount(0);
    setType("EXPENSE");
    setCategoryId("");
    setPaymentMethod("PIX");
    setDayOfMonth("1");
    setStartsOn(getToday());
    setNotes("");
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await createPlannedTransaction({
      variables: {
        input: {
          description,
          amount,
          type,
          categoryId,
          paymentMethod,
          dayOfMonth: Number(dayOfMonth),
          startsOn,
          notes: notes || undefined,
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
          <div className="px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              Novo lançamento planejado
            </h2>
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
              <CurrencyInput
                value={(amount / 100).toFixed(2)}
                placeholder="0,00"
                decimalSeparator=","
                groupSeparator="."
                disableAbbreviations
                decimalsLimit={2}
                fixedDecimalLength={2}
                transformRawValue={(rawValue) => {
                  const digits = (rawValue ?? "").replace(/\D/g, "");
                  const cents = digits ? parseInt(digits, 10) : 0;

                  const integerPart = Math.floor(cents / 100);
                  const decimalPart = String(cents % 100).padStart(2, "0");

                  return `${integerPart},${decimalPart}`;
                }}
                onValueChange={(_value, _name, values) => {
                  const cents = Math.round((values?.float ?? 0) * 100);
                  setAmount(cents);
                }}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />
            </Field>

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
                Criar planejado
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
