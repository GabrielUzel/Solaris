import { gql } from "@apollo/client";

import type {
  BudgetMonth,
  BudgetMonthPreview,
  BudgetMonthSummary,
  BudgetMonthTransaction,
  BudgetMonthTransactionFilters,
  CreateManualTransactionInput,
  PayTransactionInput,
  UpdateManualTransactionInput,
} from "./types/budget-month";

export type GetCurrentBudgetMonthData = {
  getCurrentBudgetMonth: BudgetMonth | null;
};

export type GetBudgetMonthByReferenceData = {
  getBudgetMonthByReference: BudgetMonth | null;
};

export type GetBudgetMonthPreviewData = {
  getBudgetMonthPreview: BudgetMonthPreview;
};

export type ListBudgetMonthTransactionsData = {
  listBudgetMonthTransactions: BudgetMonthTransaction[];
};

export type GetBudgetMonthSummaryData = {
  getBudgetMonthSummary: BudgetMonthSummary | null;
};

export type EnsureCurrentBudgetMonthData = {
  ensureCurrentBudgetMonth: BudgetMonth;
};

export type EnsureBudgetMonthByReferenceData = {
  ensureBudgetMonthByReference: BudgetMonth;
};

export type OpenBudgetMonthData = {
  openBudgetMonth: BudgetMonth;
};

export type CreateManualTransactionData = {
  createManualTransaction: {
    id: string;
  };
};

export type PayTransactionData = {
  payTransaction: {
    id: string;
  };
};

export type SkipTransactionData = {
  skipTransaction: {
    id: string;
  };
};

export type DeleteManualTransactionData = {
  deleteManualTransaction: boolean;
};

export type BudgetMonthByReferenceVars = {
  year: number;
  month: number;
};

export type BudgetMonthIdVars = {
  budgetMonthId: string;
};

export type CreateManualTransactionVars = {
  budgetMonthId: string;
  input: CreateManualTransactionInput;
};

export type PayTransactionVars = {
  budgetMonthId: string;
  transactionId: string;
  input?: PayTransactionInput;
};

export type SkipTransactionVars = {
  budgetMonthId: string;
  transactionId: string;
};

export type DeleteManualTransactionVars = {
  budgetMonthId: string;
  transactionId: string;
};

export type UpdateManualTransactionData = {
  updateManualTransaction: {
    id: string;
  };
};

export type UpdateManualTransactionVars = {
  budgetMonthId: string;
  transactionId: string;
  input: UpdateManualTransactionInput;
};

export type ListBudgetMonthTransactionsVars = {
  budgetMonthId: string;
  filters?: BudgetMonthTransactionFilters | null;
};

export type OpenBudgetMonthVars = {
  year: number;
  month: number;
};

export const GET_CURRENT_BUDGET_MONTH = gql`
  query GetCurrentBudgetMonth {
    getCurrentBudgetMonth {
      id
      referenceYear
      referenceMonth
      startsOn
      endsOn
      initializedAt
    }
  }
`;

export const GET_BUDGET_MONTH_BY_REFERENCE = gql`
  query GetBudgetMonthByReference($year: Int!, $month: Int!) {
    getBudgetMonthByReference(year: $year, month: $month) {
      id
      referenceYear
      referenceMonth
      startsOn
      endsOn
      initializedAt
    }
  }
`;

export const LIST_BUDGET_MONTH_TRANSACTIONS = gql`
  query ListBudgetMonthTransactions(
    $budgetMonthId: ID!
    $filters: BudgetMonthTransactionFilters
  ) {
    listBudgetMonthTransactions(
      budgetMonthId: $budgetMonthId
      filters: $filters
    ) {
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
`;

export const GET_BUDGET_MONTH_SUMMARY = gql`
  query GetBudgetMonthSummary($budgetMonthId: ID!) {
    getBudgetMonthSummary(budgetMonthId: $budgetMonthId) {
      referenceYear
      referenceMonth
      incomeExpected
      incomePaid
      expenseExpected
      expensePaid
      totalExpected
      totalPaid
      transactionCount
      isClosed
      pendingExpenseCount
    }
  }
`;

export const GET_BUDGET_MONTH_PREVIEW = gql`
  query GetBudgetMonthPreview($year: Int!, $month: Int!) {
    getBudgetMonthPreview(year: $year, month: $month) {
      referenceYear
      referenceMonth
      existsAsBudgetMonth
      transactions {
        id
        description
        amount
        type
        categoryId
        categoryName
        categoryColor
        categoryType
        paymentMethod
        dayOfMonth
        startsOn
        active
        notes
      }
      summary {
        referenceYear
        referenceMonth
        incomeExpected
        incomePaid
        expenseExpected
        expensePaid
        totalExpected
        totalPaid
        transactionCount
        isClosed
        pendingExpenseCount
      }
    }
  }
`;

export const ENSURE_CURRENT_BUDGET_MONTH = gql`
  mutation EnsureCurrentBudgetMonth {
    ensureCurrentBudgetMonth {
      id
      referenceYear
      referenceMonth
      startsOn
      endsOn
      initializedAt
    }
  }
`;

export const ENSURE_BUDGET_MONTH_BY_REFERENCE = gql`
  mutation EnsureBudgetMonthByReference($year: Int!, $month: Int!) {
    ensureBudgetMonthByReference(year: $year, month: $month) {
      id
      referenceYear
      referenceMonth
      startsOn
      endsOn
      initializedAt
    }
  }
`;

export const OPEN_BUDGET_MONTH = gql`
  mutation OpenBudgetMonth($year: Int!, $month: Int!) {
    openBudgetMonth(year: $year, month: $month) {
      id
      referenceYear
      referenceMonth
      startsOn
      endsOn
      initializedAt
    }
  }
`;

export const CREATE_MANUAL_TRANSACTION = gql`
  mutation CreateManualTransaction(
    $budgetMonthId: ID!
    $input: CreateManualTransactionInput!
  ) {
    createManualTransaction(budgetMonthId: $budgetMonthId, input: $input) {
      id
    }
  }
`;

export const PAY_TRANSACTION = gql`
  mutation PayTransaction(
    $budgetMonthId: ID!
    $transactionId: ID!
    $input: PayTransactionInput
  ) {
    payTransaction(
      budgetMonthId: $budgetMonthId
      transactionId: $transactionId
      input: $input
    ) {
      id
    }
  }
`;

export const SKIP_TRANSACTION = gql`
  mutation SkipTransaction($budgetMonthId: ID!, $transactionId: ID!) {
    skipTransaction(
      budgetMonthId: $budgetMonthId
      transactionId: $transactionId
    ) {
      id
    }
  }
`;

export const DELETE_MANUAL_TRANSACTION = gql`
  mutation DeleteManualTransaction($budgetMonthId: ID!, $transactionId: ID!) {
    deleteManualTransaction(
      budgetMonthId: $budgetMonthId
      transactionId: $transactionId
    )
  }
`;

export const UPDATE_MANUAL_TRANSACTION = gql`
  mutation UpdateManualTransaction(
    $budgetMonthId: ID!
    $transactionId: ID!
    $input: UpdateManualTransactionInput!
  ) {
    updateManualTransaction(
      budgetMonthId: $budgetMonthId
      transactionId: $transactionId
      input: $input
    ) {
      id
    }
  }
`;
