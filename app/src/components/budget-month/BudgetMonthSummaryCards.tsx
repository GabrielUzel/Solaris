import type { BudgetMonthSummary } from "../../api/types/budget-month";
import formatCurrency from "../../utils/formatCurrency";

type Props = {
  summary: BudgetMonthSummary | null;
};

export default function BudgetMonthSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <SummaryCard
        label="Receitas previstas"
        value={formatCurrency(summary?.incomeExpected)}
      />
      <SummaryCard
        label="Despesas previstas"
        value={formatCurrency(summary?.expenseExpected)}
      />
      <SummaryCard
        label="Saldo esperado"
        value={formatCurrency(summary?.totalExpected)}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-primary-border bg-card-background p-4 shadow-default">
      <span className="text-xs text-secondary-text">{label}</span>
      <span className="text-lg font-semibold text-primary-text">{value}</span>
    </div>
  );
}
