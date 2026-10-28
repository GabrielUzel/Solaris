import { Cell, Pie, PieChart, Tooltip } from "recharts";
import type { PaymentMethodExpenseSlice } from "../../api/financial-analytics";
import type { PaymentMethod } from "../../api/types/common";
import formatCurrency from "../../utils/formatCurrency";
import formatPercent from "../../utils/formatPercent";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { paymentMethodChartColors, paymentMethodLabels } from "./labels";

type Props = {
  data: PaymentMethodExpenseSlice[];
  loading: boolean;
};

function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted =
    abs >= 1_000_00
      ? `${(value / 100 / 1000).toLocaleString("pt-BR", {
          maximumFractionDigits: 1,
        })} mil`
      : (value / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  return `R$ ${formatted}`;
}

export default function ExpensesByPaymentMethodChart({ data, loading }: Props) {
  const sorted = data;
  const totalExpenses = sorted.reduce(
    (sum, slice) => sum + slice.totalAmount,
    0,
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="mb-3 text-sm font-semibold text-primary-text">
        Gastos por método de pagamento
      </h3>

      <div className="flex flex-1 flex-col justify-center">
        {loading ? (
          <div className="h-65 animate-pulse rounded-lg bg-input-background" />
        ) : data.length === 0 ? (
          <AnalyticsEmptyState message="Sem despesas registradas neste período." />
        ) : (
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-8">
            <div className="relative h-44 w-44 shrink-0">
              <PieChart width={176} height={176}>
                <Pie
                  data={sorted}
                  dataKey="totalAmount"
                  nameKey="paymentMethod"
                  innerRadius={56}
                  outerRadius={80}
                  strokeWidth={0}
                >
                  {sorted.map((slice) => (
                    <Cell
                      key={slice.paymentMethod}
                      fill={paymentMethodChartColors[slice.paymentMethod]}
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
                    const method = entry.name as PaymentMethod;
                    const slice = data.find((s) => s.paymentMethod === method);

                    return (
                      <div className="min-w-45 rounded-xl border border-primary-border bg-card-background px-4 py-3 shadow-xl">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                paymentMethodChartColors[method] ?? entry.color,
                            }}
                          />

                          <span className="text-xs font-medium text-secondary-text">
                            {paymentMethodLabels[method] ?? entry.name}
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
              </PieChart>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold tabular-nums text-primary-text">
                  {formatCompactCurrency(totalExpenses)}
                </span>
              </div>
            </div>

            <ul className="flex min-w-0 flex-1 flex-col gap-2">
              {sorted.map((slice) => (
                <li
                  key={slice.paymentMethod}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        paymentMethodChartColors[slice.paymentMethod],
                    }}
                  />

                  <span className="min-w-0 flex-1 truncate font-medium text-secondary-text">
                    {paymentMethodLabels[slice.paymentMethod]}
                  </span>

                  <span className="shrink-0 tabular-nums text-primary-text">
                    {formatCurrency(slice.totalAmount)}
                  </span>

                  <span className="w-12 shrink-0 text-right tabular-nums text-secondary-text">
                    {formatPercent(slice.percentage)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
