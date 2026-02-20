import { useQuery } from "@tanstack/react-query";
import { categoriesGateway } from "../../api/gategories/categories.gateway";

export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesGateway.getCategories(),
  });
}
