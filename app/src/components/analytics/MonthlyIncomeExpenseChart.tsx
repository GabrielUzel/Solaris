import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyIncomeExpensePoint } from "../../api/financial-analytics";
import formatCurrency from "../../utils/formatCurrency";
import AnalyticsEmptyState from "./AnalyticsEmptyState";

type Props = {
  data: MonthlyIncomeExpensePoint[];
  loading: boolean;
};

const INCOME_COLOR = "var(--color-chart-line-1)";
const EXPENSE_COLOR = "var(--color-chart-line-3)";

export default function MonthlyIncomeExpenseChart({ data, loading }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="mb-3 text-sm font-semibold text-primary-text">
        Receitas e despesas por mês
      </h3>

      <div className="flex flex-1 flex-col justify-center">
        {loading ? (
          <div className="h-65 animate-pulse rounded-lg bg-input-background" />
        ) : data.length === 0 ? (
          <AnalyticsEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
                width={90}
              />
              <Tooltip
                wrapperStyle={{ outline: "none" }}
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const point = payload[0].payload as MonthlyIncomeExpensePoint;

                  return (
                    <div className="min-w-45 rounded-xl border border-primary-border bg-card-background px-4 py-3 shadow-xl">
                      <p className="mb-2 text-xs font-medium text-secondary-text">
                        {point.label}
                      </p>

                      <div className="mb-1 flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: INCOME_COLOR }}
                        />

                        <span className="text-xs font-medium text-secondary-text">
                          Receitas
                        </span>

                        <span className="ml-auto text-base font-semibold tabular-nums text-success">
                          {formatCurrency(point.incomeTotal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: EXPENSE_COLOR }}
                        />

                        <span className="text-xs font-medium text-secondary-text">
                          Despesas
                        </span>

                        <span className="ml-auto text-base font-semibold tabular-nums text-error">
                          {formatCurrency(point.expenseTotal)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                content={() => (
                  <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2 pt-2">
                    <li className="flex items-center gap-2 text-xs font-medium text-secondary-text">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: INCOME_COLOR }}
                      />

                      <span>Receitas</span>
                    </li>

                    <li className="flex items-center gap-2 text-xs font-medium text-secondary-text">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: EXPENSE_COLOR }}
                      />

                      <span>Despesas</span>
                    </li>
                  </ul>
                )}
              />
              <Bar
                dataKey="incomeTotal"
                name="Receitas"
                fill={INCOME_COLOR}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenseTotal"
                name="Despesas"
                fill={EXPENSE_COLOR}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
