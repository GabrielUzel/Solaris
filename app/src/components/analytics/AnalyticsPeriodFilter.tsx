import type { AnalyticsPeriodOption } from "../../hooks/use-financial-analytics";

type Props = {
  period: AnalyticsPeriodOption;
  onChange: (period: AnalyticsPeriodOption) => void;
};

const OPTIONS: { value: AnalyticsPeriodOption; label: string }[] = [
  { value: "LAST_3_MONTHS", label: "Últimos 3 meses" },
  { value: "LAST_6_MONTHS", label: "Últimos 6 meses" },
  { value: "LAST_12_MONTHS", label: "Últimos 12 meses" },
  { value: "SINCE_BEGINNING", label: "Histórico" },
];

export default function AnalyticsPeriodFilter({
  period,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const isActive = option.value === period;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-button-background text-inverted-text"
                : "bg-secondary-background text-secondary-text hover:bg-hover-background",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
