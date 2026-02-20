import { useQuery } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";

export function useGetTransactionsForMonth(
  accountId: string,
  year: number,
  month: number,
) {
  return useQuery({
    queryKey: ["transactions", "for-month", accountId, year, month],
    queryFn: () =>
      transactionsGateway.getTransactionsForMonth(accountId, year, month),
    enabled: !!accountId && !!year && !!month,
  });
}
