import type {
  AssetMarket,
  AssetType,
  IncomeType,
  TransactionType,
} from "../../api/investments/types";

export const assetTypeLabels: Record<AssetType, string> = {
  STOCK: "Ação",
  REIT_FII: "FII",
  FIXED_INCOME: "Renda Fixa",
};

export const assetMarketLabels: Record<AssetMarket, string> = {
  B3: "B3",
  US_MARKET: "EUA",
};

export const transactionTypeLabels: Record<TransactionType, string> = {
  BUY: "Compra",
  REINVESTMENT: "Reinvestimento",
  PARTIAL_SELL: "Venda parcial",
  FULL_SELL: "Venda total",
  REDEMPTION: "Resgate",
};

export const incomeTypeLabels: Record<IncomeType, string> = {
  DIVIDEND: "Dividendo",
  JCP: "JCP",
  FII_INCOME: "Rendimento de FII",
  FIXED_INCOME_INTEREST: "Juros de renda fixa",
};

export const assetTypeChartColors: Record<AssetType, string> = {
  STOCK: "var(--color-chart-line-1)",
  REIT_FII: "var(--color-chart-line-2)",
  FIXED_INCOME: "var(--color-chart-line-3)",
};
