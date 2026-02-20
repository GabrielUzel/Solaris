import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsGateway } from "../../api/transctions/transactions.gateway";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsGateway.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
