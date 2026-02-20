import { useQuery } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";
import { TransactionType } from "../../gql/graphql";

export function useGetTransactionsByType(type: TransactionType) {
  return useQuery({
    queryKey: ["transactions", "type", type],
    queryFn: () => transactionsGateway.getTransactionsByType(type),
    enabled: !!type,
  });
}
