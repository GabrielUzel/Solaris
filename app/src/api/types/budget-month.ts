import type {
  FinancialType,
  PaymentMethod,
  TransactionOrigin,
  TransactionStatus,
} from "./common";
import type { PlannedTransaction } from "./planned-transaction";

export type BudgetMonth = {
  id: string;
  referenceYear: number;
  referenceMonth: number;
  startsOn: string;
  endsOn: string;
  initializedAt?: string | null;
};

export type BudgetMonthTransaction = {
  id: string;
  plannedTransactionId?: string | null;
  description: string;
  expectedAmount: number;
  actualAmount?: number | null;
  type: FinancialType;
  categoryId: string;
  categoryName?: string | null;
  categoryColor?: string | null;
  categoryType?: FinancialType | null;
  paymentMethod: PaymentMethod;
  occurredOn: string;
  origin: TransactionOrigin;
  status: TransactionStatus;
  notes?: string | null;
};

export type BudgetMonthSummary = {
  referenceYear: number;
  referenceMonth: number;
  incomeExpected: number;
  incomePaid: number;
  expenseExpected: number;
  expensePaid: number;
  totalExpected: number;
  totalPaid: number;
  transactionCount: number;
  isClosed: boolean;
  pendingExpenseCount: number;
};

export type BudgetMonthPreview = {
  referenceYear: number;
  referenceMonth: number;
  existsAsBudgetMonth: boolean;
  transactions: PlannedTransaction[];
  summary: BudgetMonthSummary;
};

export type CreateManualTransactionInput = {
  description: string;
  expectedAmount?: number;
  actualAmount?: number;
  type: FinancialType;
  categoryId: string;
  paymentMethod: PaymentMethod;
  occurredOn: string;
  status?: TransactionStatus;
  notes?: string | null;
};

export type PayTransactionInput = {
  actualAmount?: number;
};

export type UpdateManualTransactionInput = {
  description?: string;
  expectedAmount?: number;
  actualAmount?: number;
  type?: FinancialType;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  occurredOn?: string;
  status?: TransactionStatus;
  notes?: string | null;
};

export type BudgetMonthTransactionFilters = {
  categoryId?: string | null;
  name?: string | null;
  origin?: TransactionOrigin | null;
  categoryType?: FinancialType | null;
  startDate?: string | null;
  endDate?: string | null;
};
