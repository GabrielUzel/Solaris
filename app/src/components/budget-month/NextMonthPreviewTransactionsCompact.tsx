import type { BudgetMonthPreviewTransaction } from "../../api/budget-month-preview";
import formatCurrency from "../../utils/formatCurrency";

type Props = {
  transactions: BudgetMonthPreviewTransaction[];
};

export default function NextMonthPreviewTransactionsCompact({
  transactions,
}: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ul className="divide-y divide-primary-border">
        {transactions.map((t) => (
          <li key={t.id} className="flex items-center gap-2 py-2">
            <span className="w-10 shrink-0 text-xs tabular-nums text-secondary-text">
              {t.occurredOn.slice(8, 10)}/{t.occurredOn.slice(5, 7)}
            </span>

            {t.categoryColor ? (
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: t.categoryColor }}
              />
            ) : null}

            <span className="min-w-0 flex-1 truncate text-sm text-primary-text">
              {t.description}
            </span>

            <span
              className={`shrink-0 text-sm font-semibold tabular-nums ${
                t.type === "INCOME" ? "text-success" : "text-error"
              }`}
            >
              {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
