export type AssetType = "STOCK" | "REIT_FII" | "FIXED_INCOME";

export type AssetMarket = "B3" | "US_MARKET";

export type AssetIndexer = "CDI" | "SELIC" | "IPCA" | "PREFIXADO";

export type AssetLiquidity = "daily" | "maturity_only";

export type AssetCurrency = "BRL" | "USD";

export type PriceSource = "brapi_b3" | "brapi_treasury" | "finnhub_us" | "manual_curve";

export type InvestmentStatus = "open" | "closed";

export type TransactionType =
  | "BUY"
  | "REINVESTMENT"
  | "PARTIAL_SELL"
  | "FULL_SELL"
  | "REDEMPTION";

export type SaleType = "PARTIAL_SELL" | "FULL_SELL";

export type IncomeType = "DIVIDEND" | "JCP" | "FII_INCOME" | "FIXED_INCOME_INTEREST";

export type Asset = {
  id: string;
  ticker: string;
  name: string;
  assetType: AssetType;
  market: AssetMarket;
  currency: string;
  category: string | null;
  active: boolean;
  hasOpenInvestment: boolean;
  indexer: AssetIndexer | null;
  indexerRatePercent: number | null;
  issuer: string | null;
  maturityDate: string | null;
};

export type InvestmentTransaction = {
  id: string;
  transactionType: TransactionType;
  amountInvestedCents: number;
  exchangeRateUsed: number | null;
  amountInvestedUsdCents: number | null;
  quantity: number | null;
  unitPriceCents: number | null;
  transactionDate: string;
  feesCents: number | null;
  notes: string | null;
};

export type Investment = {
  id: string;
  status: InvestmentStatus;
  openedAt: string;
  closedAt: string | null;
  averagePriceCents: number;
  currentQuantity: number;
  totalInvestedCents: number;
  currentMarketValueCents: number | null;
  profitLossCents: number | null;
  roiPercent: number | null;
  twrPercent: number | null;
  xirrPercent: number | null;
  dividendYieldAccumulated: number | null;
  asset: Asset;
  transactions: InvestmentTransaction[];
};

export type AllocationSlice = {
  assetType: AssetType;
  totalValueCents: number;
  percentage: number;
};

export type InvestmentReturnRank = {
  investmentId: string;
  assetTicker: string;
  twrPercent: number | null;
  xirrPercent: number | null;
};

export type PortfolioSummary = {
  totalInvestedCents: number;
  totalMarketValueCents: number;
  totalProfitLossCents: number;
  allocationByType: AllocationSlice[];
  rankingByReturn: InvestmentReturnRank[];
};

export type InvestmentHistoryPoint = {
  date: string;
  investedAmountCents: number;
  marketValueCents: number;
  averagePriceCents: number;
  marketPriceCents: number | null;
};

export type IncomeHistoryPoint = {
  period: string;
  totalNetAmountCents: number;
};

export type DividendIncome = {
  id: string;
  incomeType: IncomeType;
  grossAmountCents: number;
  netAmountCents: number;
  paymentDate: string;
};

export type ValidateAssetTickerInput = {
  ticker: string;
  assetType: AssetType;
  market: AssetMarket;
  priceSource: string;
  externalSymbol?: string | null;
};

export type AssetTickerValidation = {
  valid: boolean;
  name: string | null;
};

export type CreateAssetInput = {
  ticker: string;
  name: string;
  assetType: AssetType;
  market: AssetMarket;
  currency: string;
  category?: string | null;
  priceSource: string;
  externalSymbol?: string | null;
  indexer?: string | null;
  indexerRatePercent?: number | null;
  issuer?: string | null;
  maturityDate?: string | null;
  liquidity?: string | null;
};

export type CreateInvestmentInput = {
  assetId: string;
  amountInvestedCents: number;
  quantity?: number | null;
  transactionDate: string;
};

export type AddReinvestmentInput = {
  investmentId: string;
  amountInvestedCents: number;
  quantity?: number | null;
  transactionDate: string;
};

export type RegisterSaleInput = {
  investmentId: string;
  quantity: number;
  unitPriceCents: number;
  transactionDate: string;
  saleType: SaleType;
};

export type RegisterIncomeInput = {
  investmentId: string;
  incomeType: IncomeType;
  grossAmountCents: number;
  netAmountCents: number;
  paymentDate: string;
  reinvestedTransactionId?: string | null;
};
