import type { BudgetMonthPreviewSummary } from "../../api/budget-month-preview";
import formatCurrency from "../../utils/formatCurrency";

type Props = {
  summary: BudgetMonthPreviewSummary;
};

export default function NextMonthPreviewSummary({ summary }: Props) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-secondary-text">Receitas previstas</span>
        <span className="text-sm font-semibold tabular-nums text-success">
          {formatCurrency(summary.incomeExpected)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-secondary-text">Despesas previstas</span>
        <span className="text-sm font-semibold tabular-nums text-error">
          {formatCurrency(summary.expenseExpected)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-secondary-text">Saldo projetado</span>
        <span
          className={`text-sm font-semibold tabular-nums ${
            summary.projectedBalance >= 0 ? "text-success" : "text-error"
          }`}
        >
          {formatCurrency(summary.projectedBalance)}
        </span>
      </div>
    </div>
  );
}
