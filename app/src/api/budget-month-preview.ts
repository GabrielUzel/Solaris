import { gql } from "@apollo/client";

import type { FinancialType, PaymentMethod } from "./types/common";

export type BudgetMonthPreviewTransaction = {
  id: string;
  plannedTransactionId: string;
  description: string;
  amount: number;
  type: FinancialType;
  paymentMethod: PaymentMethod;
  dayOfMonth: number;
  occurredOn: string;
  categoryName?: string | null;
  categoryColor?: string | null;
};

export type BudgetMonthPreviewSummary = {
  incomeExpected: number;
  expenseExpected: number;
  projectedBalance: number;
  transactionCount: number;
};

export type BudgetMonthPreview = {
  referenceYear: number;
  referenceMonth: number;
  existsAsBudgetMonth: boolean;
  transactions: BudgetMonthPreviewTransaction[];
  summary: BudgetMonthPreviewSummary;
};

export type NextBudgetMonthReference = {
  year: number;
  month: number;
};

export type GetBudgetMonthPreviewData = {
  getBudgetMonthPreview: BudgetMonthPreview;
};

export type GetBudgetMonthPreviewVars = {
  year: number;
  month: number;
};

export type GetNextUnopenedBudgetMonthReferenceData = {
  getNextUnopenedBudgetMonthReference: NextBudgetMonthReference | null;
};

export const GET_BUDGET_MONTH_PREVIEW = gql`
  query GetBudgetMonthPreview($year: Int!, $month: Int!) {
    getBudgetMonthPreview(year: $year, month: $month) {
      referenceYear
      referenceMonth
      existsAsBudgetMonth
      transactions {
        id
        plannedTransactionId
        description
        amount
        type
        paymentMethod
        dayOfMonth
        occurredOn
        categoryName
        categoryColor
      }
      summary {
        incomeExpected
        expenseExpected
        projectedBalance
        transactionCount
      }
    }
  }
`;

export const GET_NEXT_UNOPENED_BUDGET_MONTH_REFERENCE = gql`
  query GetNextUnopenedBudgetMonthReference {
    getNextUnopenedBudgetMonthReference {
      year
      month
    }
  }
`;
