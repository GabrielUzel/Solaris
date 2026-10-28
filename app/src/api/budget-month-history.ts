import { gql } from "@apollo/client";

import type {
  BudgetMonth,
  ClosedBudgetMonthReport,
} from "./types/budget-month";

export type ListPendingBudgetMonthsData = {
  listPendingBudgetMonths: BudgetMonth[];
};

export type ListClosedBudgetMonthsByYearData = {
  listClosedBudgetMonthsByYear: ClosedBudgetMonthReport[];
};

export type ListClosedBudgetMonthsByYearVars = {
  year: number;
};

export type ListYearsWithClosedBudgetMonthsData = {
  listYearsWithClosedBudgetMonths: number[];
};

export type CloseBudgetMonthData = {
  closeBudgetMonth: {
    id: string;
  };
};

export type CloseBudgetMonthVars = {
  budgetMonthId: string;
};

export const LIST_PENDING_BUDGET_MONTHS = gql`
  query ListPendingBudgetMonths {
    listPendingBudgetMonths {
      id
      referenceYear
      referenceMonth
      startsOn
      endsOn
      initializedAt
      status
    }
  }
`;

export const LIST_CLOSED_BUDGET_MONTHS_BY_YEAR = gql`
  query ListClosedBudgetMonthsByYear($year: Int!) {
    listClosedBudgetMonthsByYear(year: $year) {
      id
      referenceYear
      referenceMonth
      incomeTotal
      expenseTotal
      balance
      transactionCount
      transactions {
        id
        plannedTransactionId
        description
        expectedAmount
        actualAmount
        type
        categoryId
        categoryName
        categoryColor
        categoryType
        paymentMethod
        occurredOn
        origin
        status
        notes
      }
    }
  }
`;

export const LIST_YEARS_WITH_CLOSED_BUDGET_MONTHS = gql`
  query ListYearsWithClosedBudgetMonths {
    listYearsWithClosedBudgetMonths
  }
`;

export const CLOSE_BUDGET_MONTH = gql`
  mutation CloseBudgetMonth($budgetMonthId: ID!) {
    closeBudgetMonth(budgetMonthId: $budgetMonthId) {
      id
      status
    }
  }
`;
