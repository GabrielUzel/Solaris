import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesGateway } from "../../api/gategories/categories.gateway";
import type { UpdateCategoryMutationVariables } from "../../gql/graphql";

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCategoryMutationVariables["input"];
    }) => categoriesGateway.updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
