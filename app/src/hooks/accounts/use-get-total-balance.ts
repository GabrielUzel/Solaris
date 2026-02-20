import { useQuery } from "@tanstack/react-query";
import { accountsGateway } from "../../api/accounts/accounts.gateway";

export function useGetTotalBalance() {
  return useQuery({
    queryKey: ["accounts", "total-balance"],
    queryFn: () => accountsGateway.getTotalBalance(),
  });
}
