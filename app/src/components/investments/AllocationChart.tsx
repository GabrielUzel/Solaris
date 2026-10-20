import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { AllocationSlice } from "../../api/investments/types";
import formatCurrency from "../../utils/formatCurrency";
import formatPercent from "../../utils/formatPercent";
import { assetTypeChartColors, assetTypeLabels } from "./labels";

type Props = {
  allocation: AllocationSlice[];
  loading: boolean;
};

export default function AllocationChart({ allocation, loading }: Props) {
  return (
    <ChartCard title="Composição por tipo" loading={loading}>
      {allocation.length === 0 ? (
        <p className="py-10 text-center text-sm text-secondary-text">
          Sem dados de composição.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={allocation}
              dataKey="totalValueCents"
              nameKey="assetType"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={0}
            >
              {allocation.map((slice) => (
                <Cell
                  key={slice.assetType}
                  fill={assetTypeChartColors[slice.assetType]}
                />
              ))}
            </Pie>
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const entry = payload[0];
                const assetType = entry.name as AllocationSlice["assetType"];

                const label = assetTypeLabels[assetType] ?? entry.name;
                const color = assetTypeChartColors[assetType];
                const slice = allocation.find((s) => s.assetType === assetType);

                return (
                  <div className="min-w-45 rounded-xl border border-primary-border bg-card-background px-4 py-3 shadow-xl">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />

                      <span className="text-xs font-medium text-secondary-text">
                        {label}
                      </span>
                    </div>

                    <p className="text-base font-semibold tabular-nums text-primary-text">
                      {formatCurrency(
                        typeof entry.value === "number" ? entry.value : null,
                      )}
                    </p>

                    {slice?.percentage != null && (
                      <p className="mt-1 text-xs tabular-nums text-secondary-text">
                        {formatPercent(slice.percentage)}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              content={({ payload }) => (
                <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2 pt-4">
                  {payload?.map((entry) => {
                    const assetType =
                      entry.value as AllocationSlice["assetType"];

                    const label = assetTypeLabels[assetType] ?? entry.value;
                    const color =
                      assetTypeChartColors[assetType] ?? entry.color;

                    return (
                      <li
                        key={assetType}
                        className="flex items-center gap-2 text-xs font-medium text-secondary-text"
                      >
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />

                        <span>{label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function ChartCard({
  title,
  loading,
  children,
}: {
  title: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-primary-border bg-card-background p-5">
      <h3 className="mb-3 text-sm font-semibold text-primary-text">{title}</h3>
      {loading ? (
        <div className="h-65 animate-pulse rounded-lg bg-input-background" />
      ) : (
        children
      )}
    </div>
  );
}
