import { skipToken, useQuery } from "@apollo/client/react";

import {
  LIST_CLOSED_BUDGET_MONTHS_BY_YEAR,
  type ListClosedBudgetMonthsByYearData,
  type ListClosedBudgetMonthsByYearVars,
} from "../api/budget-month-history";

export function useClosedBudgetMonthsByYear(year?: number) {
  return useQuery<
    ListClosedBudgetMonthsByYearData,
    ListClosedBudgetMonthsByYearVars
  >(
    LIST_CLOSED_BUDGET_MONTHS_BY_YEAR,
    year != null ? { variables: { year } } : skipToken,
  );
}
