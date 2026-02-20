import { useQuery } from "@tanstack/react-query";
import { accountsGateway } from "../../api/accounts/accounts.gateway";

export function useGetAccountBalance(id: string) {
  return useQuery({
    queryKey: ["accounts", "balance", id],
    queryFn: () => accountsGateway.getAccountBalance(id),
    enabled: !!id,
  });
}
