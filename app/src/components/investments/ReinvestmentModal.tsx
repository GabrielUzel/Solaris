import { FormEvent, useEffect, useState } from "react";
import Button from "../Button";
import InfoTooltip from "../InfoTooltip";
import MoneyInput from "../MoneyInput";
import { useAddReinvestment } from "../../hooks/useInvestmentDetail";
import type { Investment } from "../../api/investments/types";
import DateInput from "../DateInput";
import { useToast } from "../Toast";

type Props = {
  open: boolean;
  investment: Investment | null;
  onClose: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export default function ReinvestmentModal(props: Props) {
  if (!props.open || !props.investment) return null;
  return <ReinvestmentForm {...props} investment={props.investment} />;
}

function ReinvestmentForm({
  investment,
  onClose,
  onPendingChange,
}: Props & { investment: Investment }) {
  const { showToast } = useToast();
  const [addReinvestment, { loading, error }] = useAddReinvestment(investment);

  const [amountCents, setAmountCents] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [transactionDate, setTransactionDate] = useState(getToday());

  useEffect(() => {
    onPendingChange?.(loading);
  }, [loading, onPendingChange]);

  const canSubmit = amountCents > 0 && transactionDate !== "" && !loading;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    const parsedQuantity = parseFloat(quantity.replace(",", "."));

    try {
      await addReinvestment({
        variables: {
          input: {
            investmentId: investment.id,
            amountInvestedCents: amountCents,
            quantity:
              quantity.trim() !== "" && !isNaN(parsedQuantity)
                ? parsedQuantity
                : null,
            transactionDate,
          },
        },
      });

      onClose();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o reinvestimento.",
      );
    }
  }

  return (
    <ModalShell
      title={`Reinvestir em ${investment.asset.ticker}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Valor investido">
          <MoneyInput value={amountCents} onChange={setAmountCents} />
        </Field>

        <Field label="Quantidade (opcional)">
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text [appearance:textfield] focus:border-focus-border focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </Field>

        <Field label="Data da transação">
          <DateInput
            value={transactionDate}
            onChange={setTransactionDate}
          />
        </Field>

        {error && <InlineError message={error.message} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {loading ? "Registrando..." : "Reinvestir"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-primary-border bg-card-background shadow-2xl">
        <div className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-primary-text">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-secondary-text">{label}</label>
        {hint && <InfoTooltip text={hint} />}
      </div>
      {children}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
      {message}
    </p>
  );
}

export function getToday() {
  return new Date().toISOString().slice(0, 10);
}
