import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesGateway } from "../../api/gategories/categories.gateway";

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesGateway.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
