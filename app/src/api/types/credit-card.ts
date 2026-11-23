import type { TransactionStatus } from "./common";

export type CreditCardInvoiceStatus = "OPEN" | "CLOSED" | "EMPTY";

export type CreditCardInvoiceEntry = {
  transactionId: string;
  budgetMonthId?: string | null;
  description: string;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  amount: number;
  expectedAmount?: number | null;
  actualAmount?: number | null;
  status: TransactionStatus;
  occurredOn: string;
  installmentNumber?: number | null;
  installmentsTotal?: number | null;
  installmentGroupId?: string | null;
  notes?: string | null;
};

export type CreditCardInvoice = {
  creditCardId: string;
  periodStart: string;
  periodEnd: string;
  closingDate: string;
  dueDate: string;
  total: number;
  paidTotal: number;
  openTotal: number;
  status: CreditCardInvoiceStatus;
  entries: CreditCardInvoiceEntry[];
};

export type CreditCard = {
  id: string;
  name: string;
  bank: string;
  closingDay: number;
  dueDay: number;
  active: boolean;
  currentInvoice?: CreditCardInvoice | null;
  hasOverdueInvoice?: boolean | null;
};

export type CreditCardInvoices = {
  currentInvoice: CreditCardInvoice | null;
  futureInvoices: CreditCardInvoice[];
};

export type CreateCreditCardInput = {
  name: string;
  bank: string;
  closingDay: number;
  dueDay: number;
};

export type UpdateCreditCardInput = {
  name?: string;
  bank?: string;
  closingDay?: number;
  dueDay?: number;
};

export type CreateCreditCardPurchaseInput = {
  description: string;
  totalAmount: number;
  categoryId: string;
  creditCardId: string;
  purchasedOn: string;
  installmentsTotal?: number;
  installmentAmounts?: number[];
  confirmAmountMismatch?: boolean;
  notes?: string;
};
