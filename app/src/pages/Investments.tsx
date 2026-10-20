import { useState } from "react";
import Button from "../components/Button";
import AllocationChart from "../components/investments/AllocationChart";
import AssetsTable from "../components/investments/AssetsTable";
import AssetTypeFilterTabs from "../components/investments/AssetTypeFilterTabs";
import CreateAssetModal from "../components/investments/CreateAssetModal";
import CreateInvestmentModal from "../components/investments/CreateInvestmentModal";
import EmptyPortfolioState from "../components/investments/EmptyPortfolioState";
import InvestmentDrawer from "../components/investments/InvestmentDrawer";
import InvestmentsTable from "../components/investments/InvestmentsTable";
import PortfolioSummaryHeader from "../components/investments/PortfolioSummaryHeader";
import ReturnRankingChart from "../components/investments/ReturnRankingChart";
import { useInvestments, usePortfolioSummary } from "../hooks/useInvestments";
import type { AssetType } from "../api/investments/types";

export default function Investments() {
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(
    null,
  );
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<
    string | null
  >(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  const summaryQuery = usePortfolioSummary();
  const investmentsQuery = useInvestments(selectedAssetType);

  const summary = summaryQuery.data?.portfolioSummary ?? null;
  const investments = investmentsQuery.data?.investments ?? [];

  // A listagem de investimentos já vem filtrada pelo tipo selecionado; o
  // ranking é cruzado com ela para respeitar o mesmo filtro, já que
  // portfolioSummary não aceita filtro por tipo.
  const allocation = selectedAssetType
    ? (summary?.allocationByType ?? []).filter(
        (slice) => slice.assetType === selectedAssetType,
      )
    : (summary?.allocationByType ?? []);

  const ranking = (summary?.rankingByReturn ?? []).filter((item) =>
    investments.some((investment) => investment.id === item.investmentId),
  );

  const portfolioEmpty =
    summary != null &&
    !summaryQuery.loading &&
    summary.totalInvestedCents === 0 &&
    summary.allocationByType.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-primary-text">
          Investimentos
        </h1>
        <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
          Novo investimento
        </Button>
      </div>

      <PortfolioSummaryHeader
        summary={summary}
        loading={summaryQuery.loading}
        error={summaryQuery.error}
        onRetry={() => summaryQuery.refetch()}
      />

      {portfolioEmpty ? (
        <>
          <EmptyPortfolioState
            onCreateClick={() => setIsCreateModalOpen(true)}
          />

          <AssetsTable
            assetType={null}
            onCreateClick={() => setIsAssetModalOpen(true)}
          />
        </>
      ) : (
        <>
          <AssetTypeFilterTabs
            value={selectedAssetType}
            onChange={setSelectedAssetType}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AllocationChart
              allocation={allocation}
              loading={summaryQuery.loading && !summary}
            />
            <ReturnRankingChart
              ranking={ranking}
              loading={summaryQuery.loading && !summary}
            />
          </div>

          <InvestmentsTable
            investments={investments}
            loading={investmentsQuery.loading}
            error={investmentsQuery.error}
            onRetry={() => investmentsQuery.refetch()}
            onSelect={setSelectedInvestmentId}
          />

          <AssetsTable
            assetType={selectedAssetType}
            onCreateClick={() => setIsAssetModalOpen(true)}
          />
        </>
      )}

      <InvestmentDrawer
        investmentId={selectedInvestmentId}
        onClose={() => setSelectedInvestmentId(null)}
      />

      <CreateInvestmentModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CreateAssetModal
        open={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
      />
    </div>
  );
}
