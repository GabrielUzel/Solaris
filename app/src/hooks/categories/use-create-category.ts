import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesGateway } from "../../api/gategories/categories.gateway";
import type { CreateCategoryMutationVariables } from "../../gql/graphql";

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryMutationVariables["input"]) =>
      categoriesGateway.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
