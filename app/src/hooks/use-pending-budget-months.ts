import { useQuery } from "@apollo/client/react";

import {
  LIST_PENDING_BUDGET_MONTHS,
  type ListPendingBudgetMonthsData,
} from "../api/budget-month-history";

export function usePendingBudgetMonths() {
  return useQuery<ListPendingBudgetMonthsData>(LIST_PENDING_BUDGET_MONTHS);
}
