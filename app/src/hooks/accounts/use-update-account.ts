import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsGateway } from "../../api/accounts/accounts.gateway";
import type { UpdateAccountMutationVariables } from "../../gql/graphql";

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateAccountMutationVariables["input"];
    }) => accountsGateway.updateAccount(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
