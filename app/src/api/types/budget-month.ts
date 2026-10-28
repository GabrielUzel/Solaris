import type {
  FinancialType,
  PaymentMethod,
  TransactionOrigin,
  TransactionStatus,
} from "./common";

export type BudgetMonthStatus = "ONGOING" | "PENDING" | "CLOSED";

export type BudgetMonth = {
  id: string;
  referenceYear: number;
  referenceMonth: number;
  startsOn: string;
  endsOn: string;
  initializedAt?: string | null;
  status: BudgetMonthStatus;
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
  status: BudgetMonthStatus;
  pendingExpenseCount: number;
};

export type ClosedBudgetMonthReport = {
  id: string;
  referenceYear: number;
  referenceMonth: number;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  transactionCount: number;
  transactions: BudgetMonthTransaction[];
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
