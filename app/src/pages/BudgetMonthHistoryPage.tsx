import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import ClosedMonthCard from "../components/budget-month-history/ClosedMonthCard";
import HistoryEmptyState from "../components/budget-month-history/HistoryEmptyState";
import YearSelector from "../components/budget-month-history/YearSelector";
import { useClosedBudgetMonthsByYear } from "../hooks/use-closed-budget-months-by-year";
import { useYearsWithClosedBudgetMonths } from "../hooks/use-years-with-closed-budget-months";

export default function BudgetMonthHistoryPage() {
  const {
    data: yearsData,
    loading: yearsLoading,
    error: yearsError,
  } = useYearsWithClosedBudgetMonths();

  const years = yearsData?.listYearsWithClosedBudgetMonths ?? [];

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    if (years.length === 0) {
      setSelectedYear(null);
      return;
    }

    setSelectedYear((current) =>
      current != null && years.includes(current)
        ? current
        : years[years.length - 1],
    );
  }, [years]);

  const {
    data: closedData,
    loading: closedLoading,
    error: closedError,
  } = useClosedBudgetMonthsByYear(selectedYear ?? undefined);

  const months = closedData?.listClosedBudgetMonthsByYear ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary-text">Histórico</h1>

        {years.length > 0 ? (
          <YearSelector
            years={years}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
          />
        ) : null}
      </div>

      {yearsLoading ? (
        <Spinner />
      ) : yearsError ? (
        <div className="rounded-xl border border-primary-border bg-card-background p-5 text-sm text-error shadow-default">
          Erro ao carregar o histórico.
        </div>
      ) : years.length === 0 ? (
        <HistoryEmptyState message="Nenhum mês fechado ainda." />
      ) : closedLoading ? (
        <Spinner />
      ) : closedError ? (
        <div className="rounded-xl border border-primary-border bg-card-background p-5 text-sm text-error shadow-default">
          Erro ao carregar o histórico.
        </div>
      ) : months.length === 0 ? (
        <HistoryEmptyState message="Nenhum mês fechado neste ano." />
      ) : (
        <div className="flex flex-col gap-4">
          {months.map((report) => (
            <ClosedMonthCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
