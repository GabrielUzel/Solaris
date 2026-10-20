import type { ErrorLike } from "@apollo/client";
import type { Investment } from "../../api/investments/types";
import formatCurrency from "../../utils/formatCurrency";
import formatPercent from "../../utils/formatPercent";
import { assetTypeLabels } from "./labels";

type Props = {
  investments: Investment[];
  loading: boolean;
  error?: ErrorLike;
  onRetry: () => void;
  onSelect: (investmentId: string) => void;
};

export default function InvestmentsTable({
  investments,
  loading,
  error,
  onRetry,
  onSelect,
}: Props) {
  if (loading && investments.length === 0) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-primary-border bg-card-background" />
    );
  }

  if (error && investments.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-primary-border bg-card-background px-5 py-4">
        <p className="text-sm text-secondary-text">
          Não foi possível carregar as posições.
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

  if (investments.length === 0) {
    return (
      <div className="rounded-2xl border border-primary-border bg-card-background px-5 py-10 text-center text-sm text-secondary-text">
        Nenhuma posição encontrada para este filtro.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-primary-border bg-card-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary-border text-left text-xs text-secondary-text">
            <th className="px-5 py-3 font-medium">Ticker</th>
            <th className="px-5 py-3 font-medium">Tipo</th>
            <th className="px-5 py-3 text-right font-medium">Investido</th>
            <th className="px-5 py-3 text-right font-medium">Valor atual</th>
            <th className="px-5 py-3 text-right font-medium">Lucro/Prejuízo</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((investment) => {
            const closed = investment.status === "closed";

            return (
              <tr
                key={investment.id}
                onClick={() => onSelect(investment.id)}
                className={[
                  "cursor-pointer border-b border-primary-border transition-colors last:border-0 hover:bg-hover-background",
                  closed ? "opacity-60" : "",
                ].join(" ")}
              >
                <td className="px-5 py-3">
                  <p className="font-medium text-primary-text">
                    {investment.asset.ticker}
                  </p>
                  <p className="text-xs text-secondary-text">
                    {investment.asset.name}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-full bg-badge-background px-2 py-0.5 text-[11px] font-medium text-primary">
                    {assetTypeLabels[investment.asset.assetType]}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-primary-text">
                  {formatCurrency(investment.totalInvestedCents)}
                </td>
                <td className="px-5 py-3 text-right text-primary-text">
                  {investment.currentMarketValueCents != null ? (
                    formatCurrency(investment.currentMarketValueCents)
                  ) : (
                    <UnavailableQuote />
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {investment.profitLossCents != null ? (
                    <ProfitLoss investment={investment} />
                  ) : (
                    <UnavailableQuote />
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      closed
                        ? "bg-secondary-text/10 text-secondary-text"
                        : "bg-success/10 text-success",
                    ].join(" ")}
                  >
                    {closed ? "Encerrado" : "Aberto"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProfitLoss({ investment }: { investment: Investment }) {
  const value = investment.profitLossCents ?? 0;
  const colorClass = value >= 0 ? "text-success" : "text-error";

  return (
    <div className={colorClass}>
      <p className="font-medium">{formatCurrency(value)}</p>
      <p className="text-xs">{formatPercent(investment.roiPercent)}</p>
    </div>
  );
}

function UnavailableQuote() {
  return (
    <span className="text-xs text-secondary-text">cotação indisponível</span>
  );
}
