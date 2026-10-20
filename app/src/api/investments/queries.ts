import { gql } from "@apollo/client";

import type {
  Asset,
  AssetMarket,
  AssetType,
  AssetTickerValidation,
  IncomeHistoryPoint,
  Investment,
  InvestmentHistoryPoint,
  PortfolioSummary,
  ValidateAssetTickerInput,
} from "./types";

export const ASSET_FIELDS = gql`
  fragment AssetFields on Asset {
    id
    ticker
    name
    assetType
    market
    currency
    category
    indexer
    indexerRatePercent
    issuer
    maturityDate
  }
`;

export const ASSET_LIST_FIELDS = gql`
  ${ASSET_FIELDS}
  fragment AssetListFields on Asset {
    ...AssetFields
    active
    hasOpenInvestment
  }
`;

export const INVESTMENT_SUMMARY_FIELDS = gql`
  ${ASSET_FIELDS}
  fragment InvestmentSummaryFields on Investment {
    id
    status
    openedAt
    closedAt
    averagePriceCents
    currentQuantity
    totalInvestedCents
    currentMarketValueCents
    profitLossCents
    roiPercent
    asset {
      ...AssetFields
    }
  }
`;

export const INVESTMENT_DETAIL_FIELDS = gql`
  ${INVESTMENT_SUMMARY_FIELDS}
  fragment InvestmentDetailFields on Investment {
    ...InvestmentSummaryFields
    twrPercent
    xirrPercent
    dividendYieldAccumulated
    transactions {
      id
      transactionType
      amountInvestedCents
      exchangeRateUsed
      amountInvestedUsdCents
      quantity
      unitPriceCents
      transactionDate
      feesCents
      notes
    }
  }
`;

export const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on InvestmentTransaction {
    id
    transactionType
    amountInvestedCents
    exchangeRateUsed
    amountInvestedUsdCents
    quantity
    unitPriceCents
    transactionDate
    feesCents
    notes
  }
`;

export const PORTFOLIO_SUMMARY = gql`
  query PortfolioSummary {
    portfolioSummary {
      totalInvestedCents
      totalMarketValueCents
      totalProfitLossCents
      allocationByType {
        assetType
        totalValueCents
        percentage
      }
      rankingByReturn {
        investmentId
        assetTicker
        twrPercent
        xirrPercent
      }
    }
  }
`;

export const LIST_INVESTMENTS = gql`
  ${INVESTMENT_SUMMARY_FIELDS}
  query Investments($status: String, $assetType: AssetType) {
    investments(status: $status, assetType: $assetType) {
      ...InvestmentSummaryFields
    }
  }
`;

export const GET_INVESTMENT = gql`
  ${INVESTMENT_DETAIL_FIELDS}
  query Investment($id: ID!) {
    investment(id: $id) {
      ...InvestmentDetailFields
    }
  }
`;

export const INVESTMENT_VALUE_HISTORY = gql`
  query InvestmentValueHistory($investmentId: ID!, $from: Date, $to: Date) {
    investmentValueHistory(investmentId: $investmentId, from: $from, to: $to) {
      date
      investedAmountCents
      marketValueCents
      averagePriceCents
      marketPriceCents
    }
  }
`;

export const INCOME_HISTORY = gql`
  query IncomeHistory($investmentId: ID, $from: Date, $to: Date) {
    incomeHistory(investmentId: $investmentId, from: $from, to: $to) {
      period
      totalNetAmountCents
    }
  }
`;

export const LIST_ASSETS = gql`
  ${ASSET_LIST_FIELDS}
  query Assets($assetType: AssetType, $market: AssetMarket, $active: Boolean) {
    assets(assetType: $assetType, market: $market, active: $active) {
      ...AssetListFields
    }
  }
`;

export const VALIDATE_ASSET_TICKER = gql`
  query ValidateAssetTicker($input: ValidateAssetTickerInput!) {
    validateAssetTicker(input: $input) {
      valid
      name
    }
  }
`;

export type GetPortfolioSummaryData = {
  portfolioSummary: PortfolioSummary;
};

export type ListInvestmentsData = {
  investments: Investment[];
};

export type ListInvestmentsVars = {
  status?: string | null;
  assetType?: AssetType | null;
};

export type GetInvestmentData = {
  investment: Investment | null;
};

export type GetInvestmentVars = {
  id: string;
};

export type GetInvestmentValueHistoryData = {
  investmentValueHistory: InvestmentHistoryPoint[];
};

export type GetInvestmentValueHistoryVars = {
  investmentId: string;
  from?: string | null;
  to?: string | null;
};

export type GetIncomeHistoryData = {
  incomeHistory: IncomeHistoryPoint[];
};

export type GetIncomeHistoryVars = {
  investmentId?: string | null;
  from?: string | null;
  to?: string | null;
};

export type ListAssetsData = {
  assets: Asset[];
};

export type ListAssetsVars = {
  assetType?: AssetType | null;
  market?: AssetMarket | null;
  active?: boolean | null;
};

export type ValidateAssetTickerData = {
  validateAssetTicker: AssetTickerValidation;
};

export type ValidateAssetTickerVars = {
  input: ValidateAssetTickerInput;
};
