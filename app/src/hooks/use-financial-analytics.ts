import { useEffect, useState } from "react";
import { skipToken, useQuery } from "@apollo/client/react";

import {
  GET_FINANCIAL_ANALYTICS,
  GET_FINANCIAL_ANALYTICS_PAGE,
  type FinancialAnalytics,
  type FinancialAnalyticsPage,
  type GetFinancialAnalyticsData,
  type GetFinancialAnalyticsPageData,
  type GetFinancialAnalyticsPageVars,
  type GetFinancialAnalyticsVars,
} from "../api/financial-analytics";
import { getLastNMonthsRange } from "../utils/period";

export type AnalyticsPeriodOption =
  | "LAST_3_MONTHS"
  | "LAST_6_MONTHS"
  | "LAST_12_MONTHS"
  | "SINCE_BEGINNING";

export const PERIOD_MONTHS: Record<
  Exclude<AnalyticsPeriodOption, "SINCE_BEGINNING">,
  number
> = {
  LAST_3_MONTHS: 3,
  LAST_6_MONTHS: 6,
  LAST_12_MONTHS: 12,
};

export function useFinancialAnalytics() {
  const [period, setPeriod] = useState<AnalyticsPeriodOption>("LAST_3_MONTHS");
  // For SINCE_BEGINNING, `page` is the 1-based window index, where page 1 is
  // the OLDEST window (ascending chronology). `null` means "not selected yet":
  // the hook fetches page 1 to learn the total, shows it briefly and then
  // jumps to the MOST RECENT window (page === totalPages).
  const [page, setPage] = useState<number | null>(null);

  const isSinceBeginning = period === "SINCE_BEGINNING";

  const range = isSinceBeginning
    ? null
    : getLastNMonthsRange(PERIOD_MONTHS[period]);

  const fixedQuery = useQuery<GetFinancialAnalyticsData, GetFinancialAnalyticsVars>(
    GET_FINANCIAL_ANALYTICS,
    !isSinceBeginning && range
      ? { variables: { startDate: range.startDate, endDate: range.endDate } }
      : skipToken,
  );

  const pagedQuery = useQuery<
    GetFinancialAnalyticsPageData,
    GetFinancialAnalyticsPageVars
  >(
    GET_FINANCIAL_ANALYTICS_PAGE,
    isSinceBeginning ? { variables: { page: page ?? 1 } } : skipToken,
  );

  const pagedData = pagedQuery.data?.getFinancialAnalyticsPage ?? null;

  useEffect(() => {
    if (
      isSinceBeginning &&
      page === null &&
      pagedData &&
      pagedData.totalPages > 0
    ) {
      setPage(pagedData.totalPages);
    }
  }, [isSinceBeginning, page, pagedData]);

  const analytics: FinancialAnalytics | null = isSinceBeginning
    ? (pagedData?.analytics ?? null)
    : (fixedQuery.data?.getFinancialAnalytics ?? null);

  const pagination: FinancialAnalyticsPage | null = isSinceBeginning
    ? pagedData
    : null;

  const loading = isSinceBeginning ? pagedQuery.loading : fixedQuery.loading;
  const error = isSinceBeginning ? pagedQuery.error : fixedQuery.error;

  function handleSetPeriod(next: AnalyticsPeriodOption) {
    setPeriod(next);
    setPage(null);
  }

  async function refetch() {
    if (isSinceBeginning) {
      await pagedQuery.refetch();
    } else {
      await fixedQuery.refetch();
    }
  }

  return {
    analytics,
    pagination,
    period,
    setPeriod: handleSetPeriod,
    loading,
    error,
    refetch,
    hasMultipleWindows: Boolean(
      pagination && pagination.totalPages > 1 && !error,
    ),
    goToOlder: () => setPage((p) => Math.max(1, (p ?? 1) - 1)),
    goToNewer: () => setPage((p) => (p == null ? p : p + 1)),
  };
}
