import type { ClosedBudgetMonthReport } from "../../api/types/budget-month";
import formatCurrency from "../../utils/formatCurrency";
import formatMonthYear from "../../utils/formatMonthYear";
import ClosedMonthTransactionsTable from "./ClosedMonthTransactionsTable";

type Props = {
  report: ClosedBudgetMonthReport;
};

export default function ClosedMonthCard({ report }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary-border bg-card-background p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-primary-text">
          {formatMonthYear(report.referenceYear, report.referenceMonth)}
        </h2>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-text">
          <span>
            Receitas:{" "}
            <span className="font-medium text-success">
              {formatCurrency(report.incomeTotal)}
            </span>
          </span>
          <span>
            Despesas:{" "}
            <span className="font-medium text-error">
              {formatCurrency(report.expenseTotal)}
            </span>
          </span>
          <span>
            Balanço:{" "}
            <span
              className={`font-medium ${
                report.balance >= 0 ? "text-success" : "text-error"
              }`}
            >
              {formatCurrency(report.balance)}
            </span>
          </span>
          <span>
            Transações:{" "}
            <span className="font-medium text-primary-text">
              {report.transactionCount}
            </span>
          </span>
        </div>
      </div>

      <ClosedMonthTransactionsTable transactions={report.transactions} />
    </div>
  );
}
