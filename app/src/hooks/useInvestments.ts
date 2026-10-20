import { useMutation, useQuery } from "@apollo/client/react";
import {
  LIST_INVESTMENTS,
  PORTFOLIO_SUMMARY,
  type GetPortfolioSummaryData,
  type ListInvestmentsData,
  type ListInvestmentsVars,
} from "../api/investments/queries";
import {
  CREATE_INVESTMENT,
  type CreateInvestmentData,
  type CreateInvestmentVars,
} from "../api/investments/mutations";
import type { AssetType } from "../api/investments/types";

export function usePortfolioSummary() {
  return useQuery<GetPortfolioSummaryData>(PORTFOLIO_SUMMARY);
}

export function useInvestments(selectedAssetType: AssetType | null) {
  return useQuery<ListInvestmentsData, ListInvestmentsVars>(LIST_INVESTMENTS, {
    variables: { assetType: selectedAssetType },
  });
}

// Sem optimisticResponse: uma posição nova exigiria inventar campos calculados
// no servidor (averagePriceCents, currentMarketValueCents, ROI...). Em vez
// disso, refetch das listas com await — o modal fica em loading até os dados
// reais chegarem.
export function useCreateInvestment() {
  return useMutation<CreateInvestmentData, CreateInvestmentVars>(
    CREATE_INVESTMENT,
    {
      refetchQueries: [LIST_INVESTMENTS, PORTFOLIO_SUMMARY],
      awaitRefetchQueries: true,
    },
  );
}
