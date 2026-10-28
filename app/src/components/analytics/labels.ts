import type { PaymentMethod } from "../../api/types/common";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  PIX: "Pix",
  BANK_TRANSFER: "Transferência bancária",
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
};

export const paymentMethodChartColors: Record<PaymentMethod, string> = {
  PIX: "var(--color-chart-line-1)",
  BANK_TRANSFER: "var(--color-chart-line-2)",
  BOLETO: "var(--color-chart-line-3)",
  CREDIT_CARD: "var(--success-text)",
  DEBIT_CARD: "var(--error-text)",
};

export const CATEGORY_FALLBACK_COLORS = [
  "var(--color-chart-line-1)",
  "var(--color-chart-line-2)",
  "var(--color-chart-line-3)",
  "var(--success-text)",
  "var(--error-text)",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
];
