import { useMutation } from "@apollo/client/react";

import {
  CLOSE_BUDGET_MONTH,
  type CloseBudgetMonthData,
  type CloseBudgetMonthVars,
} from "../api/budget-month-history";

export function useCloseBudgetMonth() {
  return useMutation<CloseBudgetMonthData, CloseBudgetMonthVars>(
    CLOSE_BUDGET_MONTH,
    {
      awaitRefetchQueries: true,
    },
  );
}
