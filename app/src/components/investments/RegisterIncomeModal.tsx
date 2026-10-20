import { FormEvent, useEffect, useState } from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import MoneyInput from "../MoneyInput";
import { useAddReinvestment, useRegisterIncome } from "../../hooks/useInvestmentDetail";
import type { IncomeType, Investment } from "../../api/investments/types";
import { incomeTypeLabels } from "./labels";
import { Field, getToday, ModalShell } from "./ReinvestmentModal";
import DateInput from "../DateInput";
import { useToast } from "../Toast";

type Props = {
  open: boolean;
  investment: Investment | null;
  onClose: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export default function RegisterIncomeModal(props: Props) {
  if (!props.open || !props.investment) return null;
  return <RegisterIncomeForm {...props} investment={props.investment} />;
}

function RegisterIncomeForm({
  investment,
  onClose,
  onPendingChange,
}: Props & { investment: Investment }) {
  const { showToast } = useToast();
  const [registerIncome, { loading: registeringIncome }] = useRegisterIncome(
    investment.id,
  );
  const [addReinvestment, { loading: reinvesting }] = useAddReinvestment(investment);

  const loading = registeringIncome || reinvesting;

  const [incomeType, setIncomeType] = useState<IncomeType>("DIVIDEND");
  const [grossAmountCents, setGrossAmountCents] = useState(0);
  const [netAmountCents, setNetAmountCents] = useState(0);
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [reinvested, setReinvested] = useState(false);

  useEffect(() => {
    onPendingChange?.(loading);
  }, [loading, onPendingChange]);

  const canSubmit =
    grossAmountCents > 0 && netAmountCents > 0 && paymentDate !== "" && !loading;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await registerIncome({
        variables: {
          input: {
            investmentId: investment.id,
            incomeType,
            grossAmountCents,
            netAmountCents,
            paymentDate,
          },
        },
      });

      if (reinvested) {
        await addReinvestment({
          variables: {
            input: {
              investmentId: investment.id,
              amountInvestedCents: netAmountCents,
              quantity: null,
              transactionDate: paymentDate,
            },
          },
        });
      }

      onClose();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o provento.",
      );
    }
  }

  return (
    <ModalShell title={`Registrar provento de ${investment.asset.ticker}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tipo de provento">
          <Dropdown
            label="Selecione o tipo"
            value={incomeType}
            onChange={(value) => setIncomeType(value as IncomeType)}
            options={(
              ["DIVIDEND", "JCP", "FII_INCOME", "FIXED_INCOME_INTEREST"] as IncomeType[]
            ).map((value) => ({ label: incomeTypeLabels[value], value }))}
          />
        </Field>

        <Field label="Valor bruto">
          <MoneyInput value={grossAmountCents} onChange={setGrossAmountCents} />
        </Field>

        <Field label="Valor líquido">
          <MoneyInput value={netAmountCents} onChange={setNetAmountCents} />
        </Field>

        <Field label="Data de pagamento">
          <DateInput
            value={paymentDate}
            onChange={setPaymentDate}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-primary-text">
          <input
            type="checkbox"
            checked={reinvested}
            onChange={(e) => setReinvested(e.target.checked)}
            className="h-4 w-4 accent-focus-border"
          />
          Marcar como reinvestido
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {loading ? "Registrando..." : "Registrar provento"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
