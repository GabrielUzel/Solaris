import { useQuery } from "@tanstack/react-query";
import { categoriesGateway } from "../../api/gategories/categories.gateway";

export function useGetCategoryByName(name: string) {
  return useQuery({
    queryKey: ["categories", "by-name", name],
    queryFn: () => categoriesGateway.getCategoryByName(name),
    enabled: !!name,
  });
}
