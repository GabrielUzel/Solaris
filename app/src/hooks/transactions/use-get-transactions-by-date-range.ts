import { useQuery } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";

export function useGetTransactionsByDateRange(
  accountId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ["transactions", "date-range", accountId, startDate, endDate],
    queryFn: () =>
      transactionsGateway.getTransactionsByDateRange(
        accountId,
        startDate,
        endDate,
      ),
    enabled: !!accountId && !!startDate && !!endDate,
  });
}
