import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";
import type { UpdateTransactionMutationVariables } from "../../gql/graphql";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTransactionMutationVariables["input"];
    }) => transactionsGateway.updateTransaction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
