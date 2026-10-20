import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BarShapeProps } from "recharts";
import type { InvestmentReturnRank } from "../../api/investments/types";
import formatPercent from "../../utils/formatPercent";
import { ChartCard } from "./AllocationChart";

type Props = {
  ranking: InvestmentReturnRank[];
  loading: boolean;
};

const ROW_HEIGHT = 40;
const BAR_SIZE = 22;
const MIN_CHART_HEIGHT = 2 * ROW_HEIGHT;
const MAX_CHART_HEIGHT = 320;
const BAR_RADIUS = 6;

export default function ReturnRankingChart({ ranking, loading }: Props) {
  const withReturn = ranking
    .filter((item) => item.twrPercent != null)
    .sort((a, b) => (b.twrPercent ?? 0) - (a.twrPercent ?? 0));

  const withoutReturn = ranking.filter((item) => item.twrPercent == null);

  const chartHeight = Math.min(
    MAX_CHART_HEIGHT,
    Math.max(MIN_CHART_HEIGHT, withReturn.length * ROW_HEIGHT),
  );

  return (
    <ChartCard title="Ranking de rentabilidade (TWR)" loading={loading}>
      <div className="flex flex-1 flex-col justify-between gap-4">
      {withReturn.length === 0 ? (
        <p className="py-10 text-center text-sm text-secondary-text">
          Sem dados de rentabilidade.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            accessibilityLayer
            data={withReturn}
            layout="vertical"
            margin={{ left: 8 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="assetTicker"
              width={80}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <Tooltip
              cursor={false}
              wrapperStyle={{ outline: "none" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const entry = payload[0];

                return (
                  <div className="min-w-45 rounded-xl border border-primary-border bg-card-background px-4 py-3 shadow-xl">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />

                      <span className="text-xs font-medium text-secondary-text">
                        TWR
                      </span>
                    </div>

                    <p className="text-base font-semibold tabular-nums text-primary-text">
                      {formatPercent(
                        typeof entry.value === "number" ? entry.value : null,
                      )}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="twrPercent" barSize={BAR_SIZE} shape={renderBar}>
              {withReturn.map((item) => (
                <Cell
                  key={item.investmentId}
                  fill={
                    (item.twrPercent ?? 0) >= 0
                      ? "var(--success-text)"
                      : "var(--error-text)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {withoutReturn.length > 0 && (
        <p className="text-xs text-secondary-text">
          Cotação indisponível para:{" "}
          {withoutReturn.map((item) => item.assetTicker).join(", ")}
        </p>
      )}
      </div>
    </ChartCard>
  );
}

// Barras negativas crescem para a esquerda: o arredondamento acompanha a
// extremidade final da barra, não o eixo zero.
function renderBar(props: BarShapeProps) {
  const { x, y, width, height, fill, value } = props;
  const negative = typeof value === "number" ? value < 0 : false;

  return (
    <path
      d={roundedBarPath(x, y, width, height, BAR_RADIUS, negative)}
      fill={fill}
    />
  );
}

function roundedBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  negative: boolean,
) {
  const r = Math.max(0, Math.min(radius, Math.abs(width) / 2, height / 2));

  if (r === 0 || width === 0) {
    return `M${x},${y} h${width} v${height} h${-width} Z`;
  }

  return negative
    ? `M${x + width},${y} h${-(width - r)} q${-r},0 ${-r},${r} v${height - 2 * r} q0,${r} ${r},${r} h${width - r} Z`
    : `M${x},${y} h${width - r} q${r},0 ${r},${r} v${height - 2 * r} q0,${r} ${-r},${r} h${-(width - r)} Z`;
}
