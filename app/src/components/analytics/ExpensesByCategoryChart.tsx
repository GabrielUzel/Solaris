import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryExpenseSlice } from "../../api/financial-analytics";
import formatCurrency from "../../utils/formatCurrency";
import formatPercent from "../../utils/formatPercent";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { CATEGORY_FALLBACK_COLORS } from "./labels";

type Props = {
  data: CategoryExpenseSlice[];
  loading: boolean;
};

export default function ExpensesByCategoryChart({ data, loading }: Props) {
  const coloredSlices = data.map((slice, index) => ({
    ...slice,
    color:
      slice.categoryColor ??
      CATEGORY_FALLBACK_COLORS[index % CATEGORY_FALLBACK_COLORS.length],
  }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="mb-3 text-sm font-semibold text-primary-text">
        Despesas por categoria
      </h3>

      <div className="flex flex-1 flex-col justify-center">
        {loading ? (
          <div className="h-65 animate-pulse rounded-lg bg-input-background" />
        ) : data.length === 0 ? (
          <AnalyticsEmptyState message="Sem despesas registradas neste período." />
        ) : (
          <ResponsiveContainer
            width="100%"
            height={Math.max(coloredSlices.length * 44, 120)}
          >
            <BarChart
              data={coloredSlices}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="categoryName"
                width={110}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(name: string) =>
                  name.length > 14 ? `${name.slice(0, 13)}…` : name
                }
              />
              <Tooltip
                wrapperStyle={{ outline: "none" }}
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const point = payload[0].payload as CategoryExpenseSlice & {
                    color?: string;
                  };

                  return (
                    <div className="min-w-45 rounded-xl border border-primary-border bg-card-background px-4 py-3 shadow-xl">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: point.color }}
                        />

                        <span className="text-xs font-medium text-secondary-text">
                          {point.categoryName}
                        </span>
                      </div>

                      <p className="text-base font-semibold tabular-nums text-primary-text">
                        {formatCurrency(point.totalAmount)}
                      </p>

                      {point.percentage != null && (
                        <p className="mt-1 text-xs tabular-nums text-secondary-text">
                          {formatPercent(point.percentage)}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]}>
                {coloredSlices.map((slice) => (
                  <Cell key={slice.categoryId} fill={slice.color} />
                ))}
                <LabelList
                  content={({ x, y, width, height, index }) => {
                    const slice = coloredSlices[index ?? 0];
                    if (!slice) {
                      return null;
                    }

                    return (
                      <text
                        x={Number(x) + Number(width) + 6}
                        y={Number(y) + Number(height) / 2}
                        dominantBaseline="middle"
                        className="fill-secondary-text"
                        fontSize={11}
                      >
                        {formatCurrency(slice.totalAmount)} ·{" "}
                        {formatPercent(slice.percentage)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
