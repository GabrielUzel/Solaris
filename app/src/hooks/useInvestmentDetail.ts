import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import {
  GET_INVESTMENT,
  INCOME_HISTORY,
  INVESTMENT_VALUE_HISTORY,
  LIST_INVESTMENTS,
  PORTFOLIO_SUMMARY,
  type GetIncomeHistoryData,
  type GetIncomeHistoryVars,
  type GetInvestmentData,
  type GetInvestmentValueHistoryData,
  type GetInvestmentValueHistoryVars,
  type GetInvestmentVars,
} from "../api/investments/queries";
import {
  ADD_REINVESTMENT,
  REGISTER_INCOME,
  REGISTER_SALE,
  type AddReinvestmentData,
  type AddReinvestmentVars,
  type RegisterIncomeData,
  type RegisterIncomeVars,
  type RegisterSaleData,
  type RegisterSaleVars,
} from "../api/investments/mutations";
import type {
  Investment,
  InvestmentTransaction,
} from "../api/investments/types";

export function useInvestmentDetail(investmentId: string | null) {
  const investment = useQuery<GetInvestmentData, GetInvestmentVars>(
    GET_INVESTMENT,
    investmentId ? { variables: { id: investmentId } } : skipToken,
  );

  const valueHistory = useQuery<
    GetInvestmentValueHistoryData,
    GetInvestmentValueHistoryVars
  >(
    INVESTMENT_VALUE_HISTORY,
    investmentId ? { variables: { investmentId } } : skipToken,
  );

  const incomeHistory = useQuery<GetIncomeHistoryData, GetIncomeHistoryVars>(
    INCOME_HISTORY,
    investmentId ? { variables: { investmentId } } : skipToken,
  );

  return {
    investment: investment.data?.investment ?? null,
    investmentLoading: investment.loading,
    investmentError: investment.error,
    refetchInvestment: investment.refetch,
    valueHistory: valueHistory.data?.investmentValueHistory ?? [],
    valueHistoryLoading: valueHistory.loading,
    valueHistoryError: valueHistory.error,
    refetchValueHistory: valueHistory.refetch,
    incomeHistory: incomeHistory.data?.incomeHistory ?? [],
    incomeHistoryLoading: incomeHistory.loading,
    incomeHistoryError: incomeHistory.error,
    refetchIncomeHistory: incomeHistory.refetch,
  };
}

function optimisticTransaction(
  vars: { input: { transactionDate: string } },
  overrides: Partial<InvestmentTransaction> &
    Pick<InvestmentTransaction, "transactionType" | "amountInvestedCents">,
): InvestmentTransaction & { __typename: string } {
  return {
    __typename: "InvestmentTransaction",
    id: `temp-transaction-${Date.now()}`,
    exchangeRateUsed: null,
    amountInvestedUsdCents: null,
    quantity: null,
    unitPriceCents: null,
    feesCents: 0,
    notes: null,
    ...overrides,
    transactionDate: vars.input.transactionDate,
  };
}

function withCurrentTransactions(
  investment: Investment,
  transaction: ReturnType<typeof optimisticTransaction>,
) {
  return [
    ...investment.transactions.map((item) => ({
      __typename: "InvestmentTransaction",
      ...item,
    })),
    transaction,
  ];
}

// Otimista apenas para a transação informada pelo usuário, inserida na lista
// já cacheada. Campos calculados (averagePriceCents, valores de mercado, ROI,
// TWR, XIRR) ficam de fora — a resposta real + refetch os atualizam, e a UI
// mostra skeleton neles enquanto a mutation está em loading.
export function useAddReinvestment(investment: Investment) {
  return useMutation<AddReinvestmentData, AddReinvestmentVars>(
    ADD_REINVESTMENT,
    {
      optimisticResponse: (vars) => ({
        addReinvestment: {
          __typename: "Investment",
          id: investment.id,
          status: investment.status,
          transactions: withCurrentTransactions(
            investment,
            optimisticTransaction(vars, {
              transactionType: "REINVESTMENT",
              amountInvestedCents: vars.input.amountInvestedCents,
              quantity: vars.input.quantity ?? null,
            }),
          ),
        },
      }),
      refetchQueries: [
        { query: GET_INVESTMENT, variables: { id: investment.id } },
        LIST_INVESTMENTS,
        PORTFOLIO_SUMMARY,
      ],
      awaitRefetchQueries: true,
    },
  );
}

export function useRegisterSale(investment: Investment) {
  return useMutation<RegisterSaleData, RegisterSaleVars>(REGISTER_SALE, {
    optimisticResponse: (vars) => ({
      registerSale: {
        __typename: "Investment",
        id: investment.id,
        status: investment.status,
        closedAt: investment.closedAt,
        transactions: withCurrentTransactions(
          investment,
          optimisticTransaction(vars, {
            transactionType: vars.input.saleType,
            amountInvestedCents: Math.round(
              vars.input.quantity * vars.input.unitPriceCents,
            ),
            quantity: vars.input.quantity,
            unitPriceCents: vars.input.unitPriceCents,
          }),
        ),
      },
    }),
    refetchQueries: [
      { query: GET_INVESTMENT, variables: { id: investment.id } },
      LIST_INVESTMENTS,
      PORTFOLIO_SUMMARY,
    ],
    awaitRefetchQueries: true,
  });
}

// Otimista para o registro do provento em si (campos todos informados pelo
// usuário). No update, apenas a resposta real (id não temporário) é somada ao
// período correspondente do incomeHistory cacheado — evitando contagem dupla
// entre a escrita otimista e a definitiva.
export function useRegisterIncome(investmentId: string) {
  return useMutation<RegisterIncomeData, RegisterIncomeVars>(REGISTER_INCOME, {
    optimisticResponse: (vars) => ({
      registerIncome: {
        __typename: "DividendIncome",
        id: `temp-income-${Date.now()}`,
        incomeType: vars.input.incomeType,
        grossAmountCents: vars.input.grossAmountCents,
        netAmountCents: vars.input.netAmountCents,
        paymentDate: vars.input.paymentDate,
      },
    }),
    update(cache, { data }) {
      const income = data?.registerIncome;
      if (!income || income.id.startsWith("temp-")) return;

      const variables: GetIncomeHistoryVars = { investmentId };
      const existing = cache.readQuery<GetIncomeHistoryData>({
        query: INCOME_HISTORY,
        variables,
      });
      if (!existing) return;

      const period = income.paymentDate.slice(0, 7);
      const current = existing.incomeHistory.find(
        (point) => point.period === period,
      );

      const incomeHistory = current
        ? existing.incomeHistory.map((point) =>
            point.period === period
              ? {
                  ...point,
                  totalNetAmountCents:
                    point.totalNetAmountCents + income.netAmountCents,
                }
              : point,
          )
        : [
            ...existing.incomeHistory,
            { __typename: "IncomeHistoryPoint", period, totalNetAmountCents: income.netAmountCents },
          ];

      cache.writeQuery({
        query: INCOME_HISTORY,
        variables,
        data: { incomeHistory },
      });
    },
  });
}
