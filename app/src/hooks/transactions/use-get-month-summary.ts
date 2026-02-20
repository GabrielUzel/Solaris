import { useQuery } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";

export function useGetMonthSummary(
  accountId: string,
  year: number,
  month: number,
) {
  return useQuery({
    queryKey: ["transactions", "month-summary", accountId, year, month],
    queryFn: () => transactionsGateway.getMonthSummary(accountId, year, month),
    enabled: !!accountId && !!year && !!month,
  });
}
