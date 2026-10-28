import { useQuery } from "@apollo/client/react";

import {
  LIST_YEARS_WITH_CLOSED_BUDGET_MONTHS,
  type ListYearsWithClosedBudgetMonthsData,
} from "../api/budget-month-history";

export function useYearsWithClosedBudgetMonths() {
  return useQuery<ListYearsWithClosedBudgetMonthsData>(
    LIST_YEARS_WITH_CLOSED_BUDGET_MONTHS,
  );
}
