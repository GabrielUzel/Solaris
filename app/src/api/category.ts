import { gql } from "@apollo/client";

import type { FinancialType } from "./types/common";
import type { CategoryItem } from "./types/category";

export type ListCategoriesData = {
  listCategories: CategoryItem[];
};

export type ListCategoriesByTypeData = {
  listCategoriesByType: CategoryItem[];
};

export type GetCategoryByIdData = {
  getCategoryById: CategoryItem | null;
};

export type CreateCategoryData = {
  createCategory: CategoryItem;
};

export type UpdateCategoryData = {
  updateCategory: CategoryItem;
};

export type DeleteCategoryData = {
  deleteCategory: boolean;
};

export type GetCategoryByIdVars = {
  id: string;
};

export type ListCategoriesByTypeVars = {
  type: FinancialType;
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

export const LIST_CATEGORIES_BY_TYPE = gql`
  query ListCategoriesByType($type: FinancialType!) {
    listCategoriesByType(type: $type) {
      id
      name
      type
      color
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query GetCategoryById($id: ID!) {
    getCategoryById(id: $id) {
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
