import { ComponentType, SVGProps } from "react";
import { Chip } from "../../ui/chip";
import type { TransactionFilter } from "../../../hooks/transactions/@shared/types";
import { TransactionType, RecurrenceFrequency } from "../../../gql/graphql";
import ArrowUpDown from "../../../assets/icons/arrow-up-down.svg?react";
import Wallet from "../../../assets/icons/wallet.svg?react";
import Calendar from "../../../assets/icons/calendar.svg?react";
import Tag from "../../../assets/icons/tag.svg?react";
import CalendarRange from "../../../assets/icons/calendar-range.svg?react";
import CalendarSync from "../../../assets/icons/calendar-sync.svg?react";

type ActiveKind = Exclude<TransactionFilter["kind"], "all">;

const CHIPS: {
  kind: ActiveKind;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { kind: "by-type", label: "Por Tipo", icon: ArrowUpDown },
  { kind: "by-account", label: "Por Conta", icon: Wallet },
  { kind: "by-category", label: "Por Categoria", icon: Tag },
  { kind: "by-recurrence", label: "Por Recorrência", icon: CalendarSync },
  { kind: "by-month", label: "Por Mês", icon: Calendar },
  { kind: "by-date-range", label: "Por Período", icon: CalendarRange },
];

const now = new Date();

const DEFAULT_FILTER: Record<ActiveKind, TransactionFilter> = {
  "by-type": { kind: "by-type", transactionType: TransactionType.Expense },
  "by-account": { kind: "by-account", accountId: "" },
  "by-category": { kind: "by-category", categoryId: "" },
  "by-recurrence": {
    kind: "by-recurrence",
    frequency: RecurrenceFrequency.Monthly,
  },
  "by-month": {
    kind: "by-month",
    accountId: "",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  },
  "by-date-range": {
    kind: "by-date-range",
    accountId: "",
    startDate: "",
    endDate: "",
  },
};

type Props = {
  filter: TransactionFilter;
  onChange: (filter: TransactionFilter) => void;
};

export function TransactionFilters({ filter, onChange }: Props) {
  const activeKind = filter.kind !== "all" ? filter.kind : null;

  function handleChipClick(kind: ActiveKind) {
    onChange(activeKind === kind ? { kind: "all" } : DEFAULT_FILTER[kind]);
  }

  return (
    <div>
      <div>
        {CHIPS.map(({ kind, label, icon }) => (
          <Chip
            key={kind}
            label={label}
            icon={icon}
            selected={activeKind === kind}
            onClick={() => handleChipClick(kind)}
          />
        ))}
        {activeKind && (
          <button onClick={() => onChange({ kind: "all" })}>
            Limpar filtro
          </button>
        )}
      </div>

      {filter.kind === "by-type" && (
        <select
          value={filter.transactionType}
          onChange={(e) =>
            onChange({
              ...filter,
              transactionType: e.target.value as TransactionType,
            })
          }
        >
          <option value={TransactionType.Income}>Receita</option>
          <option value={TransactionType.Expense}>Despesa</option>
        </select>
      )}

      {filter.kind === "by-account" && (
        <input
          placeholder="ID da conta"
          value={filter.accountId}
          onChange={(e) => onChange({ ...filter, accountId: e.target.value })}
        />
      )}

      {filter.kind === "by-category" && (
        <input
          placeholder="ID da categoria"
          value={filter.categoryId}
          onChange={(e) => onChange({ ...filter, categoryId: e.target.value })}
        />
      )}

      {filter.kind === "by-recurrence" && (
        <select
          value={filter.frequency}
          onChange={(e) =>
            onChange({
              ...filter,
              frequency: e.target.value as RecurrenceFrequency,
            })
          }
        >
          {Object.values(RecurrenceFrequency).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      )}

      {filter.kind === "by-month" && (
        <div>
          <input
            placeholder="ID da conta"
            value={filter.accountId}
            onChange={(e) => onChange({ ...filter, accountId: e.target.value })}
          />
          <input
            type="number"
            placeholder="Ano"
            value={filter.year}
            onChange={(e) =>
              onChange({ ...filter, year: Number(e.target.value) })
            }
          />
          <input
            type="number"
            placeholder="Mês (1-12)"
            value={filter.month}
            onChange={(e) =>
              onChange({ ...filter, month: Number(e.target.value) })
            }
          />
        </div>
      )}

      {filter.kind === "by-date-range" && (
        <div>
          <input
            placeholder="ID da conta"
            value={filter.accountId}
            onChange={(e) => onChange({ ...filter, accountId: e.target.value })}
          />
          <input
            type="date"
            value={filter.startDate}
            onChange={(e) => onChange({ ...filter, startDate: e.target.value })}
          />
          <input
            type="date"
            value={filter.endDate}
            onChange={(e) => onChange({ ...filter, endDate: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
