import type { FinancialType, PaymentMethod } from "./common";

export type PlannedTransaction = {
  id: string;
  description: string;
  amount: number;
  type: FinancialType;
  categoryId: string;
  categoryName?: string | null;
  categoryColor?: string | null;
  categoryType?: FinancialType | null;
  paymentMethod: PaymentMethod;
  dayOfMonth: number;
  startsOn: string;
  active: boolean;
  notes?: string | null;
};

export type CreatePlannedTransactionInput = {
  description: string;
  amount: number;
  type: FinancialType;
  categoryId: string;
  paymentMethod: PaymentMethod;
  dayOfMonth: number;
  startsOn: string;
  notes?: string | null;
};

export type UpdatePlannedTransactionInput = {
  description?: string;
  amount?: number;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  dayOfMonth?: number;
  startsOn?: string;
  notes?: string | null;
};

export type CreatePlannedTransactionData = {
  createPlannedTransaction: PlannedTransaction;
};

export type UpdatePlannedTransactionData = {
  updatePlannedTransaction: PlannedTransaction;
};

export type DeactivatePlannedTransactionData = {
  deactivatePlannedTransaction: PlannedTransaction;
};

export type ReactivatePlannedTransactionData = {
  reactivatePlannedTransaction: PlannedTransaction;
};

export type DeletePlannedTransactionData = {
  deletePlannedTransaction: boolean;
};

export type GetPlannedTransactionByIdData = {
  getPlannedTransactionById: PlannedTransaction | null;
};

export type ListActivePlannedTransactionsData = {
  listActivePlannedTransactions: PlannedTransaction[];
};

export type CreatePlannedTransactionVars = {
  input: CreatePlannedTransactionInput;
};

export type UpdatePlannedTransactionVars = {
  id: string;
  input: UpdatePlannedTransactionInput;
};

export type DeactivatePlannedTransactionVars = {
  id: string;
};

export type ReactivatePlannedTransactionVars = {
  id: string;
};

export type DeletePlannedTransactionVars = {
  id: string;
};

export type GetPlannedTransactionByIdVars = {
  id: string;
};
