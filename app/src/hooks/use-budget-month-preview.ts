import { skipToken, useQuery } from "@apollo/client/react";

import {
  GET_BUDGET_MONTH_PREVIEW,
  type GetBudgetMonthPreviewData,
  type GetBudgetMonthPreviewVars,
} from "../api/budget-month-preview";

export function useBudgetMonthPreview(year?: number, month?: number) {
  const { data, loading, error, refetch } = useQuery<
    GetBudgetMonthPreviewData,
    GetBudgetMonthPreviewVars
  >(
    GET_BUDGET_MONTH_PREVIEW,
    year != null && month != null ? { variables: { year, month } } : skipToken,
  );

  return {
    preview: data?.getBudgetMonthPreview ?? null,
    loading,
    error,
    refetch,
  };
}
