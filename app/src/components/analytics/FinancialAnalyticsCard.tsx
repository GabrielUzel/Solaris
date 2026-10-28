import { useFinancialAnalytics } from "../../hooks/use-financial-analytics";
import { formatAnalyticsRange } from "../../utils/period";
import Button from "../Button";
import AnalyticsPeriodFilter from "./AnalyticsPeriodFilter";
import ExpensesByCategoryChart from "./ExpensesByCategoryChart";
import ExpensesByPaymentMethodChart from "./ExpensesByPaymentMethodChart";
import MonthlyIncomeExpenseChart from "./MonthlyIncomeExpenseChart";

export default function FinancialAnalyticsCard() {
  const {
    analytics,
    pagination,
    period,
    setPeriod,
    loading,
    error,
    refetch,
    hasMultipleWindows,
    goToOlder,
    goToNewer,
  } = useFinancialAnalytics();

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-primary-border bg-card-background p-5 shadow-default">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-primary-text">
          Análise financeira
        </h2>
        <AnalyticsPeriodFilter period={period} onChange={setPeriod} />
      </div>

      {!error && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {loading && !analytics ? (
            <span className="h-4 w-40 animate-pulse rounded bg-input-background" />
          ) : (
            analytics?.period && (
              <p className="text-xs text-secondary-text">
                {formatAnalyticsRange(
                  analytics.period.startDate,
                  analytics.period.endDate,
                )}
                {period === "SINCE_BEGINNING" &&
                pagination &&
                pagination.totalPages <= 1
                  ? " · Todo o histórico"
                  : ""}
              </p>
            )
          )}

          {hasMultipleWindows && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                disabled={loading || !pagination?.hasPreviousPage}
                onClick={goToOlder}
                className="gap-1 px-2 py-1 text-xs"
              >
                ← Mais antigos
              </Button>

              <Button
                variant="ghost"
                disabled={loading || !pagination?.hasNextPage}
                onClick={goToNewer}
                className="gap-1 px-2 py-1 text-xs"
              >
                Mais recentes →
              </Button>
            </div>
          )}
        </div>
      )}

      {error ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-secondary-text">
            Não foi possível carregar a análise financeira.
          </p>
          <Button
            variant="secondary"
            onClick={() => void refetch()}
            className="self-start"
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          <MonthlyIncomeExpenseChart
            data={analytics?.monthlyIncomeExpenseTrend ?? []}
            loading={loading}
          />

          <div className="border-t border-primary-border" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ExpensesByCategoryChart
              data={analytics?.expensesByCategory ?? []}
              loading={loading}
            />

            <ExpensesByPaymentMethodChart
              data={analytics?.expensesByPaymentMethod ?? []}
              loading={loading}
            />
          </div>

          <p className="text-xs text-secondary-text">
            Inclui valores realizados e previstos; lançamentos ignorados não
            entram na análise.
          </p>
        </>
      )}
    </div>
  );
}
