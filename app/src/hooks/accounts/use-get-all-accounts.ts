import { useQuery } from "@tanstack/react-query";
import { accountsGateway } from "../../api/accounts/accounts.gateway";

export function useGetAllAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountsGateway.getAllAccounts(),
  });
}
