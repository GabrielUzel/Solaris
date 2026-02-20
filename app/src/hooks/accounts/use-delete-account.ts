import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsGateway } from "../../api/accounts/accounts.gateway";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsGateway.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
