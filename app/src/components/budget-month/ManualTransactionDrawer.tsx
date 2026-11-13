import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import CurrencyInput from "react-currency-input-field";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { useListCategories } from "../../hooks/category";
import { useCreateManualTransaction } from "../../hooks/budget-month";
import {
  useCreateCreditCardPurchase,
  useListCreditCards,
} from "../../hooks/credit-card";
import { useToast } from "../Toast";
import type { FinancialType, PaymentMethod } from "../../api/types/common";
import DateInput from "../DateInput";
import MoneyInput from "../MoneyInput";
import { getBank } from "../../utils/banks";
import formatCurrency from "../../utils/formatCurrency";

type PurchaseCondition = "SINGLE" | "INSTALLMENTS";

type Props = {
  open: boolean;
  onClose: () => void;
  budgetMonthId: string | null;
  onSuccess?: () => Promise<void> | void;
};

export default function ManualTransactionDrawer({
  open,
  onClose,
  budgetMonthId,
  onSuccess,
}: Props) {
  const { data: categoriesData } = useListCategories();
  const { data: cardsData } = useListCreditCards();
  const [createManualTransaction, { loading }] = useCreateManualTransaction();
  const [createCreditCardPurchase, { loading: creatingPurchase }] =
    useCreateCreditCardPurchase();
  const { showToast } = useToast();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<FinancialType>("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [occurredOn, setOccurredOn] = useState(getToday());
  const [notes, setNotes] = useState("");
  const [creditCardId, setCreditCardId] = useState("");
  const [purchaseCondition, setPurchaseCondition] =
    useState<PurchaseCondition>("SINGLE");
  const [installmentsTotal, setInstallmentsTotal] = useState(2);
  const [installmentAmounts, setInstallmentAmounts] = useState<number[]>([]);
  const [amountsConfirmedMismatch, setAmountsConfirmedMismatch] =
    useState(false);

  const categories = categoriesData?.listCategories ?? [];
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  const activeCards = useMemo(
    () => (cardsData?.listCreditCards ?? []).filter((card) => card.active),
    [cardsData],
  );
  const cardOptions = useMemo(
    () =>
      activeCards.map((card) => ({
        label: `${card.name} · ${getBank(card.bank).name}`,
        value: card.id,
      })),
    [activeCards],
  );

  const isCardPayment = paymentMethod === "CREDIT_CARD";
  const isInstallments =
    isCardPayment && purchaseCondition === "INSTALLMENTS";
  const installmentsSum = installmentAmounts.reduce(
    (total, value) => total + value,
    0,
  );
  const hasAmountMismatch = isInstallments && installmentsSum !== amount;
  const isSubmitting = loading || creatingPurchase;

  useEffect(() => {
    if (!open) return;
    setDescription("");
    setAmount(0);
    setType("EXPENSE");
    setCategoryId("");
    setPaymentMethod("PIX");
    setOccurredOn(getToday());
    setNotes("");
    setCreditCardId("");
    setPurchaseCondition("SINGLE");
    setInstallmentsTotal(2);
    setInstallmentAmounts([]);
    setAmountsConfirmedMismatch(false);
  }, [open]);

  useEffect(() => {
    if (!isInstallments) {
      setInstallmentAmounts([]);
      return;
    }

    setInstallmentAmounts(splitAmount(amount, installmentsTotal));
  }, [amount, installmentsTotal, purchaseCondition, paymentMethod]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!budgetMonthId) return;

    if (!categoryId) {
      showToast("Selecione uma categoria para o lançamento.");
      return;
    }

    if (isCardPayment) {
      if (type !== "EXPENSE") {
        showToast("Apenas despesas podem ser vinculadas a um cartão de crédito.");
        return;
      }

      if (!creditCardId) {
        showToast("Selecione um cartão para o pagamento.");
        return;
      }

      if (hasAmountMismatch && !amountsConfirmedMismatch) return;

      try {
        await createCreditCardPurchase({
          variables: {
            input: {
              description,
              totalAmount: amount,
              categoryId,
              creditCardId,
              purchasedOn: occurredOn,
              installmentsTotal: isInstallments ? installmentsTotal : 1,
              installmentAmounts: isInstallments
                ? installmentAmounts
                : undefined,
              confirmAmountMismatch: isInstallments
                ? amountsConfirmedMismatch
                : undefined,
              notes: notes || undefined,
            },
          },
        });
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "Não foi possível registrar a compra no cartão.",
        );
        return;
      }

      await onSuccess?.();
      onClose();
      return;
    }

    try {
      await createManualTransaction({
        variables: {
          budgetMonthId,
          input: {
            description,
            expectedAmount: amount,
            type,
            categoryId,
            paymentMethod,
            occurredOn,
            status: "EXPECTED",
            notes: notes || undefined,
          },
        },
      });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível adicionar o lançamento ao mês.",
      );
      return;
    }

    await onSuccess?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 animate-overlay-fade bg-black/50"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md animate-drawer-slide border-l border-primary-border bg-card-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              Novo lançamento do mês
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

            <Field label="Valor previsto">
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

            {isCardPayment && (
              <>
                <Field label="Cartão">
                  <Dropdown
                    label="Selecione o cartão"
                    value={creditCardId}
                    onChange={setCreditCardId}
                    options={cardOptions}
                  />
                </Field>

                <Field label="Condição">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPurchaseCondition("SINGLE")}
                      className={[
                        "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                        purchaseCondition === "SINGLE"
                          ? "border-focus-border bg-hover-background text-primary-text"
                          : "border-primary-border bg-input-background text-secondary-text hover:bg-hover-background",
                      ].join(" ")}
                    >
                      À vista
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurchaseCondition("INSTALLMENTS")}
                      className={[
                        "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                        purchaseCondition === "INSTALLMENTS"
                          ? "border-focus-border bg-hover-background text-primary-text"
                          : "border-primary-border bg-input-background text-secondary-text hover:bg-hover-background",
                      ].join(" ")}
                    >
                      Parcelado
                    </button>
                  </div>
                </Field>

                {isInstallments && (
                  <>
                    <Field label="Número de parcelas">
                      <input
                        type="number"
                        min="2"
                        max="48"
                        value={installmentsTotal}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setInstallmentsTotal(
                            Number.isInteger(next) && next >= 2 && next <= 48
                              ? next
                              : 2,
                          );
                        }}
                        className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                      {installmentAmounts.map((value, index) => (
                        <Field key={index} label={`Parcela ${index + 1}`}>
                          <MoneyInput
                            value={value}
                            onChange={(cents) =>
                              setInstallmentAmounts((prev) =>
                                prev.map((item, itemIndex) =>
                                  itemIndex === index ? cents : item,
                                ),
                              )
                            }
                          />
                        </Field>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-secondary-text">
                        Soma das parcelas: {formatCurrency(installmentsSum)} de{" "}
                        {formatCurrency(amount)}
                      </span>

                      {hasAmountMismatch && (
                        <>
                          <span className="text-xs text-warning">
                            A soma das parcelas é diferente do valor total.
                          </span>
                          <label className="flex items-center gap-2 text-xs text-secondary-text">
                            <input
                              type="checkbox"
                              checked={amountsConfirmedMismatch}
                              onChange={(e) =>
                                setAmountsConfirmedMismatch(e.target.checked)
                              }
                            />
                            Confirmo a diferença
                          </label>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <Field
              label={isCardPayment ? "Data da compra" : "Data da ocorrência"}
            >
              <DateInput
                value={occurredOn}
                onChange={setOccurredOn}
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
              <Button
                type="submit"
                disabled={isSubmitting || (hasAmountMismatch && !amountsConfirmedMismatch)}
              >
                Adicionar ao mês
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

function splitAmount(total: number, parts: number) {
  const safeParts = parts > 0 ? parts : 1;
  const base = Math.floor(total / safeParts);
  const remainder = total % safeParts;

  return Array.from({ length: safeParts }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}
