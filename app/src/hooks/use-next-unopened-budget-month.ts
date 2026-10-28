import { useQuery } from "@apollo/client/react";

import {
  GET_NEXT_UNOPENED_BUDGET_MONTH_REFERENCE,
  type GetNextUnopenedBudgetMonthReferenceData,
} from "../api/budget-month-preview";

export function useNextUnopenedBudgetMonth() {
  const { data, loading, error, refetch } =
    useQuery<GetNextUnopenedBudgetMonthReferenceData>(
      GET_NEXT_UNOPENED_BUDGET_MONTH_REFERENCE,
    );

  return {
    data: data?.getNextUnopenedBudgetMonthReference ?? null,
    loading,
    error,
    refetch,
  };
}
