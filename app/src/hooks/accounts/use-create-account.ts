import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsGateway } from "../../api/accounts/accounts.gateway";
import type { CreateAccountMutationVariables } from "../../gql/graphql";

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountMutationVariables["input"]) =>
      accountsGateway.createAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
