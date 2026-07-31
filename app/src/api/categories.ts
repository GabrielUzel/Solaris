import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

export type CategoryItem = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
};

type ListCategoriesData = {
  listCategories: CategoryItem[];
};

type CreateCategoryInput = {
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
};

type UpdateCategoryInput = {
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
};

type CreateCategoryData = {
  createCategory: CategoryItem;
};

type UpdateCategoryData = {
  updateCategory: CategoryItem;
};

type DeleteCategoryData = {
  deleteCategory: boolean;
};

export const LIST_CATEGORIES = gql`
  query ListCategories {
    listCategories {
      id
      name
      type
      color
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      type
      color
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      type
      color
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export function useCategories() {
  return useQuery<ListCategoriesData>(LIST_CATEGORIES);
}

export function useCreateCategory() {
  return useMutation<CreateCategoryData, { input: CreateCategoryInput }>(
    CREATE_CATEGORY,
    {
      refetchQueries: [{ query: LIST_CATEGORIES }],
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
