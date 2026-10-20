import { useState } from "react";
import type { ErrorLike } from "@apollo/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Button from "../Button";
import { useInvestmentDetail } from "../../hooks/useInvestmentDetail";
import type {
  IncomeHistoryPoint,
  Investment,
  InvestmentHistoryPoint,
} from "../../api/investments/types";
import formatCurrency from "../../utils/formatCurrency";
import formatPercent from "../../utils/formatPercent";
import ReinvestmentModal from "./ReinvestmentModal";
import RegisterSaleModal from "./RegisterSaleModal";
import RegisterIncomeModal from "./RegisterIncomeModal";
import { assetTypeLabels, transactionTypeLabels } from "./labels";

type ActiveModal = "reinvestment" | "sale" | "income" | null;

type Props = {
  investmentId: string | null;
  onClose: () => void;
};

export default function InvestmentDrawer({ investmentId, onClose }: Props) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [mutationPending, setMutationPending] = useState(false);

  const {
    investment,
    investmentLoading,
    investmentError,
    refetchInvestment,
    valueHistory,
    valueHistoryLoading,
    valueHistoryError,
    refetchValueHistory,
    incomeHistory,
    incomeHistoryLoading,
    incomeHistoryError,
    refetchIncomeHistory,
  } = useInvestmentDetail(investmentId);

  if (!investmentId) return null;

  // Enquanto o detalhe da nova seleção não chega, dados de uma posição
  // anterior não devem aparecer no drawer.
  const currentInvestment =
    investment && investment.id === investmentId ? investment : null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar detalhes"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-primary-border bg-card-background shadow-2xl">
        {investmentLoading && !currentInvestment ? (
          <DrawerSkeleton />
        ) : investmentError && !currentInvestment ? (
          <DrawerError onRetry={() => refetchInvestment()} onClose={onClose} />
        ) : currentInvestment ? (
          <div className="flex flex-col gap-6 px-6 py-5">
            <DrawerHeader investment={currentInvestment} onClose={onClose} />

            <PositionSummary
              investment={currentInvestment}
              recalculating={mutationPending}
            />

            {currentInvestment.status === "open" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveModal("reinvestment")}
                >
                  Reinvestir
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveModal("sale")}
                >
                  Registrar venda
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveModal("income")}
                >
                  Registrar provento
                </Button>
              </div>
            )}

            <ValueHistoryChart
              history={valueHistory}
              loading={valueHistoryLoading}
              error={valueHistoryError}
              errorMessage={resolveApiKeyErrorMessage(valueHistoryError)}
              onRetry={() => refetchValueHistory()}
              currency={currentInvestment.asset.currency}
            />

            {(incomeHistoryLoading || incomeHistory.length > 0) && (
              <IncomeHistoryChart
                history={incomeHistory}
                loading={incomeHistoryLoading}
                error={incomeHistoryError}
                onRetry={() => refetchIncomeHistory()}
              />
            )}

            <TransactionsTable investment={currentInvestment} />
          </div>
        ) : null}
      </div>

      <ReinvestmentModal
        open={activeModal === "reinvestment"}
        investment={currentInvestment}
        onClose={() => setActiveModal(null)}
        onPendingChange={setMutationPending}
      />
      <RegisterSaleModal
        open={activeModal === "sale"}
        investment={currentInvestment}
        onClose={() => setActiveModal(null)}
        onPendingChange={setMutationPending}
      />
      <RegisterIncomeModal
        open={activeModal === "income"}
        investment={currentInvestment}
        onClose={() => setActiveModal(null)}
        onPendingChange={setMutationPending}
      />
    </div>
  );
}

function DrawerHeader({
  investment,
  onClose,
}: {
  investment: Investment;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-primary-text">
            {investment.asset.ticker}
          </h2>
          <span className="inline-flex items-center rounded-full bg-badge-background px-2 py-0.5 text-[11px] font-medium text-primary">
            {assetTypeLabels[investment.asset.assetType]}
          </span>
          {investment.status === "closed" && (
            <span className="inline-flex items-center rounded-full bg-secondary-text/10 px-2 py-0.5 text-[11px] font-medium text-secondary-text">
              Encerrado
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-secondary-text">
          {investment.asset.name}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="rounded-lg p-1.5 text-secondary-text transition-colors hover:bg-hover-background hover:text-primary-text"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

function PositionSummary({
  investment,
  recalculating,
}: {
  investment: Investment;
  recalculating: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <SummaryItem label="Preço médio" recalculating={recalculating}>
        {formatCurrency(investment.averagePriceCents)}
      </SummaryItem>
      <SummaryItem label="Quantidade atual">
        {formatQuantity(investment.currentQuantity)}
      </SummaryItem>
      <SummaryItem label="Valor investido">
        {formatCurrency(investment.totalInvestedCents)}
      </SummaryItem>
      <SummaryItem label="Valor de mercado" recalculating={recalculating}>
        {investment.currentMarketValueCents != null ? (
          formatCurrency(investment.currentMarketValueCents)
        ) : (
          <span className="text-xs font-normal text-secondary-text">
            cotação indisponível
          </span>
        )}
      </SummaryItem>
      <SummaryItem label="ROI" recalculating={recalculating}>
        <PercentValue value={investment.roiPercent} />
      </SummaryItem>
      <SummaryItem label="TWR" recalculating={recalculating}>
        <PercentValue value={investment.twrPercent} />
      </SummaryItem>
      <SummaryItem label="XIRR" recalculating={recalculating}>
        <PercentValue value={investment.xirrPercent} />
      </SummaryItem>
      <SummaryItem label="Proventos acumulados" recalculating={recalculating}>
        {formatPercent(investment.dividendYieldAccumulated)}
      </SummaryItem>
      <SummaryItem label="Aberto em">
        {formatDate(investment.openedAt)}
      </SummaryItem>
    </div>
  );
}

function SummaryItem({
  label,
  recalculating = false,
  children,
}: {
  label: string;
  recalculating?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-primary-border bg-input-background/40 px-3 py-2">
      <p className="text-[11px] text-secondary-text">{label}</p>
      {recalculating ? (
        <div className="mt-1 h-5 w-20 animate-pulse rounded bg-input-background" />
      ) : (
        <p className="mt-0.5 text-sm font-semibold text-primary-text">
          {children}
        </p>
      )}
    </div>
  );
}

function PercentValue({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-xs font-normal text-secondary-text">—</span>;
  }

  return (
    <span className={value >= 0 ? "text-success" : "text-error"}>
      {formatPercent(value)}
    </span>
  );
}

type WithGraphQLErrors = {
  graphQLErrors?: readonly { message: string }[];
};

function resolveApiKeyErrorMessage(
  error: ErrorLike | undefined,
): string | null {
  const code = (error as WithGraphQLErrors | undefined)?.graphQLErrors?.[0]
    ?.message;
  if (code === "brapi_key_not_configured") {
    return "Chave Brapi não configurada. Acesse Configurações para adicioná-la.";
  }
  if (code === "finnhub_key_not_configured") {
    return "Chave Finnhub não configurada. Acesse Configurações para adicioná-la.";
  }
  return null;
}

// Evolução do preço unitário do ativo no período, com o preço médio pago
// como referência — leitura no estilo de apps de corretora. Investido e
// valor de mercado da posição ficam no resumo acima.
function ValueHistoryChart({
  history,
  loading,
  error,
  errorMessage,
  onRetry,
  currency,
}: {
  history: InvestmentHistoryPoint[];
  loading: boolean;
  error?: ErrorLike;
  errorMessage?: string | null;
  onRetry: () => void;
  currency: string;
}) {
  const data = history
    .filter((point) => point.marketPriceCents != null)
    .map((point) => ({
      date: formatShortDate(point.date),
      price: (point.marketPriceCents ?? 0) / 100,
    }));

  const latestAveragePriceCents =
    [...history].reverse().find((point) => point.averagePriceCents > 0)
      ?.averagePriceCents ?? null;

  const averagePrice =
    latestAveragePriceCents != null ? latestAveragePriceCents / 100 : null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary-text">
          Evolução do preço
        </h3>
        {averagePrice != null && (
          <div className="flex items-center gap-3 text-[11px] text-secondary-text">
            <span className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--color-chart-line-1)" }}
              />
              Preço
            </span>
            <span className="flex items-center gap-1">
              <span
                className="h-0.5 w-4 border-t border-dashed"
                style={{ borderColor: "var(--color-chart-line-2)" }}
              />
              Preço médio
            </span>
          </div>
        )}
      </div>

      {loading && data.length === 0 ? (
        <div className="h-56 animate-pulse rounded-lg bg-input-background" />
      ) : error && data.length === 0 ? (
        <BlockError
          message={
            errorMessage ?? "Não foi possível carregar a evolução do preço."
          }
          onRetry={onRetry}
        />
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-xs text-secondary-text">
          Sem histórico de preço.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid
              stroke="var(--color-primary-border)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={48}
              domain={["auto", "auto"]}
              tickFormatter={formatCompact}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-primary-border)" }}
              wrapperStyle={{ outline: "none" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const value = payload[0]?.value;

                return (
                  <div className="min-w-45 rounded-xl border border-primary-border bg-card-background px-4 py-3 shadow-xl">
                    <p className="mb-1 text-xs font-medium text-secondary-text">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-primary-text">
                      {formatQuote(
                        typeof value === "number" ? value : null,
                        currency,
                      )}
                    </p>
                  </div>
                );
              }}
            />
            {averagePrice != null && (
              <ReferenceLine
                y={averagePrice}
                stroke="var(--color-chart-line-2)"
                strokeDasharray="4 4"
              />
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--color-chart-line-1)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

function IncomeHistoryChart({
  history,
  loading,
  error,
  onRetry,
}: {
  history: IncomeHistoryPoint[];
  loading: boolean;
  error?: ErrorLike;
  onRetry: () => void;
}) {
  const data = history.map((point) => ({
    period: formatPeriod(point.period),
    total: point.totalNetAmountCents / 100,
  }));

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-primary-text">
        Proventos por período
      </h3>

      {loading && data.length === 0 ? (
        <div className="h-48 animate-pulse rounded-lg bg-input-background" />
      ) : error && data.length === 0 ? (
        <BlockError
          message="Não foi possível carregar os proventos."
          onRetry={onRetry}
        />
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-xs text-secondary-text">
          Nenhum provento registrado.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={48}
              tickFormatter={formatCompact}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              wrapperStyle={{ outline: "none" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const value = payload[0]?.value;

                return (
                  <div className="min-w-45 rounded-xl border border-primary-border bg-card-background px-4 py-3 shadow-xl">
                    <p className="mb-1 text-xs font-medium text-secondary-text">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-primary-text">
                      {formatReais(typeof value === "number" ? value : null)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="total"
              fill="var(--color-chart-line-3)"
              radius={[6, 6, 0, 0]}
              barSize={40}
              activeBar={false}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

function TransactionsTable({ investment }: { investment: Investment }) {
  const sorted = [...investment.transactions].sort((a, b) =>
    b.transactionDate.localeCompare(a.transactionDate),
  );

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-primary-text">
        Histórico de transações
      </h3>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-xs text-secondary-text">
          Nenhuma transação registrada.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-primary-border bg-input-background/40 text-left text-secondary-text">
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 text-right font-medium">Qtd.</th>
                <th className="px-3 py-2 text-right font-medium">
                  Preço unit.
                </th>
                <th className="px-3 py-2 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-primary-border last:border-0"
                >
                  <td className="px-3 py-2 text-primary-text">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="px-3 py-2 text-primary-text">
                    {transactionTypeLabels[transaction.transactionType]}
                  </td>
                  <td className="px-3 py-2 text-right text-primary-text">
                    {transaction.quantity != null
                      ? formatQuantity(transaction.quantity)
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-primary-text">
                    {transaction.unitPriceCents != null
                      ? formatCurrency(transaction.unitPriceCents)
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-primary-text">
                    {formatCurrency(transaction.amountInvestedCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-6 py-5">
      <div className="h-7 w-40 animate-pulse rounded bg-input-background" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-14 animate-pulse rounded-xl bg-input-background"
          />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-lg bg-input-background" />
      <div className="h-40 animate-pulse rounded-lg bg-input-background" />
    </div>
  );
}

function DrawerError({
  onRetry,
  onClose,
}: {
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
      <p className="text-sm text-secondary-text">
        Não foi possível carregar os detalhes da posição.
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button type="button" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}

function BlockError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary-border px-3 py-2">
      <p className="text-xs text-secondary-text">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs font-medium text-primary hover:underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatShortDate(value: string) {
  const [, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}`;
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  return `${month}/${year.slice(2)}`;
}

function formatQuantity(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 8 });
}

function formatReais(value: number | null) {
  if (value == null) return "R$ —";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// marketPriceCents vem na moeda de negociação do ativo (BRL na B3, USD nos EUA).
function formatQuote(value: number | null, currency: string) {
  if (value == null) return "—";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "BRL",
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
