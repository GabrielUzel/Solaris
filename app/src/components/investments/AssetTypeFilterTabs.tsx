import type { AssetType } from "../../api/investments/types";
import { assetTypeLabels } from "./labels";

type Props = {
  value: AssetType | null;
  onChange: (value: AssetType | null) => void;
};

const tabs: { label: string; value: AssetType | null }[] = [
  { label: "Todos", value: null },
  { label: assetTypeLabels.STOCK, value: "STOCK" },
  { label: assetTypeLabels.REIT_FII, value: "REIT_FII" },
  { label: assetTypeLabels.FIXED_INCOME, value: "FIXED_INCOME" },
];

export default function AssetTypeFilterTabs({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onChange(tab.value)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-focus-border bg-hover-background text-primary"
                : "border-primary-border bg-card-background text-secondary-text hover:bg-hover-background hover:text-primary-text",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
