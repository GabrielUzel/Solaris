import { FormEvent, useEffect, useState } from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import MoneyInput from "../MoneyInput";
import { useRegisterSale } from "../../hooks/useInvestmentDetail";
import type { Investment, SaleType } from "../../api/investments/types";
import { Field, getToday, InlineError, ModalShell } from "./ReinvestmentModal";
import DateInput from "../DateInput";
import { useToast } from "../Toast";

type Props = {
  open: boolean;
  investment: Investment | null;
  onClose: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export default function RegisterSaleModal(props: Props) {
  if (!props.open || !props.investment) return null;
  return <RegisterSaleForm {...props} investment={props.investment} />;
}

function RegisterSaleForm({
  investment,
  onClose,
  onPendingChange,
}: Props & { investment: Investment }) {
  const { showToast } = useToast();
  const [registerSale, { loading, error }] = useRegisterSale(investment);

  const [saleType, setSaleType] = useState<SaleType>("PARTIAL_SELL");
  const [quantity, setQuantity] = useState("");
  const [unitPriceCents, setUnitPriceCents] = useState(0);
  const [transactionDate, setTransactionDate] = useState(getToday());
  const [confirmedFullSell, setConfirmedFullSell] = useState(false);

  useEffect(() => {
    onPendingChange?.(loading);
  }, [loading, onPendingChange]);

  useEffect(() => {
    if (saleType === "FULL_SELL") {
      setQuantity(String(investment.currentQuantity));
    }
  }, [saleType, investment.currentQuantity]);

  const parsedQuantity = parseFloat(quantity.replace(",", "."));
  const hasValidQuantity = quantity.trim() !== "" && !isNaN(parsedQuantity) && parsedQuantity > 0;
  const isFullSell = saleType === "FULL_SELL";
  const needsConfirmation = isFullSell && !confirmedFullSell;

  const canSubmit =
    hasValidQuantity && unitPriceCents > 0 && transactionDate !== "" && !loading;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    // Validação para venda parcial
    if (saleType === "PARTIAL_SELL" && parsedQuantity >= investment.currentQuantity) {
      showToast(
        "Para venda parcial, a quantidade deve ser menor que a disponível. Use 'Venda total' para encerrar a posição.",
      );
      return;
    }

    if (needsConfirmation) {
      setConfirmedFullSell(true);
      return;
    }

    await registerSale({
      variables: {
        input: {
          investmentId: investment.id,
          quantity: parsedQuantity,
          unitPriceCents,
          transactionDate,
          saleType,
        },
      },
    });

    onClose();
  }

  return (
    <ModalShell title={`Registrar venda de ${investment.asset.ticker}`} onClose={onClose}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tipo de venda">
          <Dropdown
            label="Selecione o tipo de venda"
            value={saleType}
            onChange={(value) => {
              setSaleType(value as SaleType);
              setConfirmedFullSell(false);
            }}
            options={[
              { label: "Venda parcial", value: "PARTIAL_SELL" },
              { label: "Venda total (encerra a posição)", value: "FULL_SELL" },
            ]}
          />
        </Field>

        <Field label={`Quantidade vendida (disponível: ${formatQuantity(investment.currentQuantity)})`}>
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
            disabled={saleType === "FULL_SELL"}
            className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text [appearance:textfield] focus:border-focus-border focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </Field>

        <Field label="Preço unitário de venda">
          <MoneyInput value={unitPriceCents} onChange={setUnitPriceCents} />
        </Field>

        <Field label="Data da venda">
          <DateInput
            value={transactionDate}
            onChange={setTransactionDate}
          />
        </Field>

        {confirmedFullSell && (
          <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
            A venda total encerra esta posição. Clique novamente em
            &quot;Registrar venda&quot; para confirmar.
          </p>
        )}

        {error && <InlineError message={error.message} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={needsConfirmation ? "danger" : "primary"}
            disabled={!canSubmit}
          >
            {loading
              ? "Registrando..."
              : needsConfirmation
                ? "Confirmar venda total"
                : "Registrar venda"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function formatQuantity(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 8 });
}
