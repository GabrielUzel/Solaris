import type { ErrorLike } from "@apollo/client";
import type { PortfolioSummary } from "../../api/investments/types";
import formatCurrency from "../../utils/formatCurrency";
import formatPercent from "../../utils/formatPercent";

type Props = {
  summary: PortfolioSummary | null;
  loading: boolean;
  error?: ErrorLike;
  onRetry: () => void;
};

export default function PortfolioSummaryHeader({
  summary,
  loading,
  error,
  onRetry,
}: Props) {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl border border-primary-border bg-card-background"
          />
        ))}
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-primary-border bg-card-background px-5 py-4">
        <p className="text-sm text-secondary-text">
          Não foi possível carregar o resumo da carteira.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-primary hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const profitLoss = summary.totalProfitLossCents;
  const roiPercent =
    summary.totalInvestedCents > 0
      ? (profitLoss / summary.totalInvestedCents) * 100
      : null;
  const profitClass = profitLoss >= 0 ? "text-success" : "text-error";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        label="Total investido"
        value={formatCurrency(summary.totalInvestedCents)}
      />
      <SummaryCard
        label="Valor atual de mercado"
        value={formatCurrency(summary.totalMarketValueCents)}
      />
      <div className="rounded-2xl border border-primary-border bg-card-background px-5 py-4">
        <p className="text-xs text-secondary-text">Lucro / Prejuízo</p>
        <p className={`mt-1 text-xl font-semibold ${profitClass}`}>
          {formatCurrency(profitLoss)}
        </p>
        <p className={`text-xs ${profitClass}`}>
          {roiPercent != null ? `${formatPercent(roiPercent)} no período` : ""}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-primary-border bg-card-background px-5 py-4">
      <p className="text-xs text-secondary-text">{label}</p>
      <p className="mt-1 text-xl font-semibold text-primary-text">{value}</p>
    </div>
  );
}
