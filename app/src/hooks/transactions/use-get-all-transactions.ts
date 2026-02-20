import { useQuery } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";

export function useGetAllTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: () => transactionsGateway.getAllTransactions(),
  });
}
