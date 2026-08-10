import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  GET_CATEGORY_BY_ID,
  LIST_CATEGORIES,
  LIST_CATEGORIES_BY_TYPE,
  UPDATE_CATEGORY,
  type CreateCategoryData,
  type DeleteCategoryData,
  type GetCategoryByIdData,
  type GetCategoryByIdVars,
  type ListCategoriesByTypeData,
  type ListCategoriesByTypeVars,
  type ListCategoriesData,
  type UpdateCategoryData,
} from "../api/category";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../api/types/category";
import type { FinancialType } from "../api/types/common";

export function useListCategories() {
  return useQuery<ListCategoriesData>(LIST_CATEGORIES);
}

export function useListCategoriesByType(type?: FinancialType) {
  return useQuery<ListCategoriesByTypeData, ListCategoriesByTypeVars>(
    LIST_CATEGORIES_BY_TYPE,
    type ? { variables: { type } } : skipToken,
  );
}

export function useGetCategoryById(id?: string) {
  return useQuery<GetCategoryByIdData, GetCategoryByIdVars>(
    GET_CATEGORY_BY_ID,
    id ? { variables: { id } } : skipToken,
  );
}

export function useCreateCategory() {
  return useMutation<CreateCategoryData, { input: CreateCategoryInput }>(
    CREATE_CATEGORY,
    {
      refetchQueries: [{ query: LIST_CATEGORIES }],
      awaitRefetchQueries: true,
    },
  );
}

export function useUpdateCategory() {
  return useMutation<
    UpdateCategoryData,
    { id: string; input: UpdateCategoryInput }
  >(UPDATE_CATEGORY, {
    refetchQueries: [{ query: LIST_CATEGORIES }],
  });
}

export function useDeleteCategory() {
  return useMutation<DeleteCategoryData, { id: string }>(DELETE_CATEGORY, {
    refetchQueries: [{ query: LIST_CATEGORIES }],
  });
}
