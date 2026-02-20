import { useQuery } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";
import { RecurrenceFrequency } from "../../gql/graphql";

export function useGetTransactionsByRecurrence(frequency: RecurrenceFrequency) {
  return useQuery({
    queryKey: ["transactions", "recurrence", frequency],
    queryFn: () => transactionsGateway.getTransactionsByRecurrence(frequency),
    enabled: !!frequency,
  });
}
