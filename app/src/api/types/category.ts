import type { FinancialType } from "./common";

export type CategoryItem = {
  id: string;
  name: string;
  type: FinancialType;
  color: string;
};

export type CreateCategoryInput = {
  name: string;
  type: FinancialType;
  color: string;
};

export type UpdateCategoryInput = {
  name?: string;
  type?: FinancialType;
  color?: string;
};
