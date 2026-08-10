import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_MANUAL_TRANSACTION,
  DELETE_MANUAL_TRANSACTION,
  ENSURE_BUDGET_MONTH_BY_REFERENCE,
  ENSURE_CURRENT_BUDGET_MONTH,
  GET_BUDGET_MONTH_BY_REFERENCE,
  GET_BUDGET_MONTH_PREVIEW,
  GET_BUDGET_MONTH_SUMMARY,
  GET_CURRENT_BUDGET_MONTH,
  LIST_BUDGET_MONTH_TRANSACTIONS,
  OPEN_BUDGET_MONTH,
  PAY_TRANSACTION,
  SKIP_TRANSACTION,
  UPDATE_MANUAL_TRANSACTION,
  type BudgetMonthByReferenceVars,
  type BudgetMonthIdVars,
  type CreateManualTransactionData,
  type CreateManualTransactionVars,
  type DeleteManualTransactionData,
  type DeleteManualTransactionVars,
  type EnsureBudgetMonthByReferenceData,
  type EnsureCurrentBudgetMonthData,
  type GetBudgetMonthByReferenceData,
  type GetBudgetMonthPreviewData,
  type GetBudgetMonthSummaryData,
  type GetCurrentBudgetMonthData,
  type ListBudgetMonthTransactionsData,
  type ListBudgetMonthTransactionsVars,
  type OpenBudgetMonthData,
  type OpenBudgetMonthVars,
  type PayTransactionData,
  type PayTransactionVars,
  type SkipTransactionData,
  type SkipTransactionVars,
  type UpdateManualTransactionData,
  type UpdateManualTransactionVars,
} from "../api/budget-month";

export function useGetCurrentBudgetMonth() {
  return useQuery<GetCurrentBudgetMonthData>(GET_CURRENT_BUDGET_MONTH);
}

export function useGetBudgetMonthByReference(year?: number, month?: number) {
  return useQuery<GetBudgetMonthByReferenceData, BudgetMonthByReferenceVars>(
    GET_BUDGET_MONTH_BY_REFERENCE,
    year != null && month != null ? { variables: { year, month } } : skipToken,
  );
}

export function useGetBudgetMonthPreview(year?: number, month?: number) {
  return useQuery<GetBudgetMonthPreviewData, BudgetMonthByReferenceVars>(
    GET_BUDGET_MONTH_PREVIEW,
    year != null && month != null ? { variables: { year, month } } : skipToken,
  );
}

export function useGetBudgetMonthSummary(budgetMonthId?: string) {
  return useQuery<GetBudgetMonthSummaryData, BudgetMonthIdVars>(
    GET_BUDGET_MONTH_SUMMARY,
    budgetMonthId ? { variables: { budgetMonthId } } : skipToken,
  );
}

export function useListBudgetMonthTransactions(
  budgetMonthId?: string,
  filters?: ListBudgetMonthTransactionsVars["filters"],
) {
  return useQuery<
    ListBudgetMonthTransactionsData,
    ListBudgetMonthTransactionsVars
  >(
    LIST_BUDGET_MONTH_TRANSACTIONS,
    budgetMonthId ? { variables: { budgetMonthId, filters } } : skipToken,
  );
}

export function useEnsureCurrentBudgetMonth() {
  return useMutation<EnsureCurrentBudgetMonthData>(
    ENSURE_CURRENT_BUDGET_MONTH,
    {
      refetchQueries: [{ query: GET_CURRENT_BUDGET_MONTH }],
      awaitRefetchQueries: true,
    },
  );
}

export function useEnsureBudgetMonthByReference() {
  return useMutation<
    EnsureBudgetMonthByReferenceData,
    BudgetMonthByReferenceVars
  >(ENSURE_BUDGET_MONTH_BY_REFERENCE, {
    awaitRefetchQueries: true,
  });
}

export function useOpenBudgetMonth() {
  return useMutation<OpenBudgetMonthData, OpenBudgetMonthVars>(
    OPEN_BUDGET_MONTH,
    {
      awaitRefetchQueries: true,
    },
  );
}

export function useCreateManualTransaction() {
  return useMutation<CreateManualTransactionData, CreateManualTransactionVars>(
    CREATE_MANUAL_TRANSACTION,
    {
      awaitRefetchQueries: true,
    },
  );
}

export function useUpdateManualTransaction() {
  return useMutation<UpdateManualTransactionData, UpdateManualTransactionVars>(
    UPDATE_MANUAL_TRANSACTION,
    {
      awaitRefetchQueries: true,
    },
  );
}

export function usePayTransaction() {
  return useMutation<PayTransactionData, PayTransactionVars>(PAY_TRANSACTION, {
    awaitRefetchQueries: true,
  });
}

export function useSkipTransaction() {
  return useMutation<SkipTransactionData, SkipTransactionVars>(
    SKIP_TRANSACTION,
    {
      awaitRefetchQueries: true,
    },
  );
}

export function useDeleteManualTransaction() {
  return useMutation<DeleteManualTransactionData, DeleteManualTransactionVars>(
    DELETE_MANUAL_TRANSACTION,
    {
      awaitRefetchQueries: true,
    },
  );
}
