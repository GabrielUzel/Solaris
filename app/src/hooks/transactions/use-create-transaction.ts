import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";
import type { CreateTransactionMutationVariables } from "../../gql/graphql";

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionMutationVariables["input"]) =>
      transactionsGateway.createTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
