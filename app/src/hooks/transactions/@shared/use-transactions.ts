import { useQuery } from "@tanstack/react-query";
import { transactionsGateway } from "../../../api/transctions/transactions.gateway";
import type { TransactionFilter } from "./types";

export type TransactionResult =
  | Awaited<ReturnType<typeof transactionsGateway.getAllTransactions>>
  | Awaited<ReturnType<typeof transactionsGateway.getTransactionsByAccount>>
  | Awaited<ReturnType<typeof transactionsGateway.getTransactionsByCategory>>
  | Awaited<ReturnType<typeof transactionsGateway.getTransactionsByType>>
  | Awaited<ReturnType<typeof transactionsGateway.getTransactionsByRecurrence>>
  | Awaited<ReturnType<typeof transactionsGateway.getTransactionsForMonth>>
  | Awaited<ReturnType<typeof transactionsGateway.getTransactionsByDateRange>>;

async function fetchTransactions(
  filter: TransactionFilter,
): Promise<TransactionResult> {
  switch (filter.kind) {
    case "all":
      return transactionsGateway.getAllTransactions();
    case "by-account":
      return transactionsGateway.getTransactionsByAccount(filter.accountId);
    case "by-category":
      return transactionsGateway.getTransactionsByCategory(filter.categoryId);
    case "by-type":
      return transactionsGateway.getTransactionsByType(filter.transactionType);
    case "by-recurrence":
      return transactionsGateway.getTransactionsByRecurrence(filter.frequency);
    case "by-month":
      return transactionsGateway.getTransactionsForMonth(
        filter.accountId,
        filter.year,
        filter.month,
      );
    case "by-date-range":
      return transactionsGateway.getTransactionsByDateRange(
        filter.accountId,
        filter.startDate,
        filter.endDate,
      );
  }
}

function isFilterReady(filter: TransactionFilter): boolean {
  switch (filter.kind) {
    case "all":
      return true;
    case "by-type":
      return !!filter.transactionType;
    case "by-recurrence":
      return !!filter.frequency;
    case "by-account":
      return !!filter.accountId;
    case "by-category":
      return !!filter.categoryId;
    case "by-month":
      return !!filter.accountId && !!filter.year && !!filter.month;
    case "by-date-range":
      return !!filter.accountId && !!filter.startDate && !!filter.endDate;
  }
}

export function useTransactions(filter: TransactionFilter) {
  return useQuery({
    queryKey: ["transactions", filter],
    queryFn: () => fetchTransactions(filter),
    enabled: isFilterReady(filter),
  });
}
