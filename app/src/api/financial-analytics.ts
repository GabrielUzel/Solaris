import { gql } from "@apollo/client";

import type { PaymentMethod } from "./types/common";

export type AnalyticsPeriod = {
  startDate: string;
  endDate: string;
  monthCount: number;
};

export type CategoryExpenseSlice = {
  categoryId: string;
  categoryName: string;
  categoryColor?: string | null;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
};

export type MonthlyIncomeExpensePoint = {
  year: number;
  month: number;
  label: string;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
};

export type PaymentMethodExpenseSlice = {
  paymentMethod: PaymentMethod;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
};

export type FinancialAnalyticsTotals = {
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  transactionCount: number;
};

export type FinancialAnalytics = {
  period: AnalyticsPeriod;
  expensesByCategory: CategoryExpenseSlice[];
  monthlyIncomeExpenseTrend: MonthlyIncomeExpensePoint[];
  expensesByPaymentMethod: PaymentMethodExpenseSlice[];
  totals: FinancialAnalyticsTotals;
};

export type FinancialAnalyticsPage = {
  page: number;
  pageSize: number;
  totalMonths: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  analytics: FinancialAnalytics;
};

export type GetFinancialAnalyticsData = {
  getFinancialAnalytics: FinancialAnalytics;
};

export type GetFinancialAnalyticsVars = {
  startDate: string;
  endDate: string;
};

export type GetFinancialAnalyticsPageData = {
  getFinancialAnalyticsPage: FinancialAnalyticsPage;
};

export type GetFinancialAnalyticsPageVars = {
  page: number;
  pageSize?: number;
};

export const GET_FINANCIAL_ANALYTICS = gql`
  query GetFinancialAnalytics($startDate: Date!, $endDate: Date!) {
    getFinancialAnalytics(startDate: $startDate, endDate: $endDate) {
      period {
        startDate
        endDate
        monthCount
      }
      expensesByCategory {
        categoryId
        categoryName
        categoryColor
        totalAmount
        transactionCount
        percentage
      }
      monthlyIncomeExpenseTrend {
        year
        month
        label
        incomeTotal
        expenseTotal
        balance
      }
      expensesByPaymentMethod {
        paymentMethod
        totalAmount
        transactionCount
        percentage
      }
      totals {
        incomeTotal
        expenseTotal
        balance
        transactionCount
      }
    }
  }
`;

export const GET_FINANCIAL_ANALYTICS_PAGE = gql`
  query GetFinancialAnalyticsPage($page: Int!, $pageSize: Int) {
    getFinancialAnalyticsPage(page: $page, pageSize: $pageSize) {
      page
      pageSize
      totalMonths
      totalPages
      hasNextPage
      hasPreviousPage
      analytics {
        period {
          startDate
          endDate
          monthCount
        }
        expensesByCategory {
          categoryId
          categoryName
          categoryColor
          totalAmount
          transactionCount
          percentage
        }
        monthlyIncomeExpenseTrend {
          year
          month
          label
          incomeTotal
          expenseTotal
          balance
        }
        expensesByPaymentMethod {
          paymentMethod
          totalAmount
          transactionCount
          percentage
        }
        totals {
          incomeTotal
          expenseTotal
          balance
          transactionCount
        }
      }
    }
  }
`;
