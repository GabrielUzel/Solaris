import { useQuery } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";

export function useGetTransactionsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ["transactions", "category", categoryId],
    queryFn: () => transactionsGateway.getTransactionsByCategory(categoryId),
    enabled: !!categoryId,
  });
}
