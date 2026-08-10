import { useEffect, useRef, useState } from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import DateRangeFilter from "../DateRangeFilter";
import Plus from "../../assets/icons/plus.svg?react";
import Edit from "../../assets/icons/edit.svg?react";
import Check from "../../assets/icons/check.svg?react";
import Trash from "../../assets/icons/trash.svg?react";
import StatusTag from "../StatusTag";
import type { BudgetMonthTransaction } from "../../api/types/budget-month";
import type {
  FinancialType,
  TransactionOrigin,
  TransactionStatus,
} from "../../api/types/common";
import formatCurrency from "../../utils/formatCurrency";
import formatMonthYear from "../../utils/formatMonthYear";
import TransactionDetailsDrawer from "./TransactionDetailsDrawer";
import type { BudgetMonthTransactionFilters } from "../../api/types/budget-month";

type Props = {
  hasBudgetMonth: boolean;
  transactions: BudgetMonthTransaction[];
  onAdd: () => void;
  onEdit?: (transaction: BudgetMonthTransaction) => void;
  onPay?: (transaction: BudgetMonthTransaction) => void;
  onDelete?: (transaction: BudgetMonthTransaction) => void;
  referenceYear?: number;
  referenceMonth?: number;
  filters: BudgetMonthTransactionFilters;
  onFiltersChange: (filters: BudgetMonthTransactionFilters) => void;
};

export default function BudgetMonthTransactionsCard({
  hasBudgetMonth,
  transactions,
  onAdd,
  onEdit,
  onPay,
  onDelete,
  referenceYear,
  referenceMonth,
  filters,
  onFiltersChange,
}: Props) {
  const monthLabel =
    referenceYear != null && referenceMonth != null
      ? formatMonthYear(referenceYear, referenceMonth)
      : null;

  const [selectedTransaction, setSelectedTransaction] =
    useState<BudgetMonthTransaction | null>(null);

  const [nameDraft, setNameDraft] = useState(filters.name ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNameDraft(filters.name ?? "");
  }, [filters.name]);

  function handleNameDraftChange(value: string) {
    setNameDraft(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, name: value || null });
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-primary-border bg-card-background p-5 shadow-default">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-primary-text">
                Lançamentos do mês
              </h2>

              {monthLabel ? (
                <span className="rounded-full bg-secondary-background px-2 py-0.5 text-xs text-secondary-text">
                  {monthLabel}
                </span>
              ) : null}
            </div>

            <span className="text-xs text-secondary-text">
              {transactions.length} itens
            </span>
          </div>

          <Button
            variant="primary"
            className="p-0"
            onClick={onAdd}
            aria-label="Adicionar lançamento"
            title="Adicionar lançamento"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Novo lançamento
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <input
            className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
            placeholder="Filtrar por nome"
            value={nameDraft}
            onChange={(e) => handleNameDraftChange(e.target.value)}
          />

          <Dropdown
            label="Origem"
            placeholder="Origem"
            value={filters.origin ?? ""}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                origin: (value as TransactionOrigin) || null,
              })
            }
            options={[
              { label: "Todas as origens", value: "" },
              { label: "Manual", value: "MANUAL" },
              { label: "Planejado", value: "PLANNED" },
            ]}
          />

          <Dropdown
            label="Tipo da categoria"
            placeholder="Tipo da categoria"
            value={filters.categoryType ?? ""}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                categoryType: (value as FinancialType) || null,
              })
            }
            options={[
              { label: "Todos os tipos", value: "" },
              { label: "Receita", value: "INCOME" },
              { label: "Despesa", value: "EXPENSE" },
            ]}
          />

          <DateRangeFilter
            startDate={filters.startDate}
            endDate={filters.endDate}
            onChange={({ startDate, endDate }) =>
              onFiltersChange({ ...filters, startDate, endDate })
            }
          />
        </div>

        {!hasBudgetMonth ? (
          <div className="rounded-lg bg-secondary-background px-4 py-6 text-sm text-secondary-text">
            Nenhum mês atual foi aberto ainda.
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-lg bg-secondary-background px-4 py-6 text-sm text-secondary-text">
            Nenhum lançamento encontrado para este mês.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-primary-border">
            <table className="w-full table-fixed">
              <thead className="bg-secondary-background">
                <tr className="text-left text-xs font-medium text-secondary-text">
                  <th className="w-[34%] px-4 py-3">Descrição</th>
                  <th className="w-[11%] px-2 py-3">Status</th>
                  <th className="w-[11%] px-2 py-3">Tipo</th>
                  <th className="w-[12%] px-2 py-3">Data</th>
                  <th className="w-[8%] px-2 py-3">Cat.</th>
                  <th className="w-[12%] px-2 py-3 text-right">Valor</th>
                  <th className="w-[12%] px-3 py-3 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-primary-border">
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={onEdit}
                    onPay={onPay}
                    onDelete={onDelete}
                    onOpenDetails={setSelectedTransaction}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionDetailsDrawer
        open={Boolean(selectedTransaction)}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}

function TransactionRow({
  transaction,
  onEdit,
  onPay,
  onDelete,
  onOpenDetails,
}: {
  transaction: BudgetMonthTransaction;
  onEdit?: (transaction: BudgetMonthTransaction) => void;
  onPay?: (transaction: BudgetMonthTransaction) => void;
  onDelete?: (transaction: BudgetMonthTransaction) => void;
  onOpenDetails: (transaction: BudgetMonthTransaction) => void;
}) {
  const displayAmount = transaction.actualAmount ?? transaction.expectedAmount;
  const dateLabel = formatDate(transaction.occurredOn);
  const originLabel = transaction.origin === "PLANNED" ? "Planejado" : "Avulso";
  const statusTag = toStatusTag(transaction.status);
  const isPlanned = transaction.origin === "PLANNED";

  function handleOpenDetails() {
    onOpenDetails(transaction);
  }

  function stopRowOpen(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <tr
      className="cursor-pointer bg-card-background transition-colors hover:bg-hover-background/40"
      onClick={handleOpenDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenDetails();
        }
      }}
    >
      <td className="px-4 py-3 align-middle">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-medium text-primary-text">
            {transaction.description}
          </span>
        </div>
      </td>

      <td className="px-2 py-3 align-middle">
        <StatusTag status={statusTag} />
      </td>

      <td className="px-2 py-3 align-middle text-sm text-secondary-text">
        {originLabel}
      </td>

      <td className="px-2 py-3 align-middle text-sm text-secondary-text">
        {dateLabel}
      </td>

      <td className="px-2 py-3 align-middle">
        <CategoryDot color={transaction.categoryColor} />
      </td>

      <td
        className={`px-2 py-3 align-middle text-right text-sm font-semibold ${
          transaction.type === "INCOME" ? "text-success" : "text-error"
        }`}
      >
        {transaction.type === "INCOME" ? "+" : "-"}{" "}
        {formatCurrency(displayAmount)}
      </td>

      <td className="px-3 py-3 align-middle">
        <div
          className="flex items-center justify-end gap-1 whitespace-nowrap"
          onClick={stopRowOpen}
        >
          {!isPlanned && (
            <IconActionButton
              label="Editar lançamento"
              title="Editar lançamento"
              onClick={() => onEdit?.(transaction)}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </IconActionButton>
          )}

          <IconActionButton
            label={
              transaction.status === "PAID"
                ? "Lançamento já pago"
                : "Marcar como pago"
            }
            title={
              transaction.status === "PAID"
                ? "Lançamento já pago"
                : "Marcar como pago"
            }
            onClick={() => onPay?.(transaction)}
            disabled={transaction.status !== "EXPECTED"}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </IconActionButton>

          {!isPlanned && (
            <IconActionButton
              label="Excluir lançamento"
              title="Excluir lançamento"
              onClick={() => onDelete?.(transaction)}
              className="text-error"
            >
              <Trash className="h-4 w-4" aria-hidden="true" />
            </IconActionButton>
          )}
        </div>
      </td>
    </tr>
  );
}

function IconActionButton({
  label,
  title,
  onClick,
  disabled = false,
  className = "",
  children,
}: {
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={`p-1.5 ${className}`}
      aria-label={label}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

function CategoryDot({ color }: { color?: string | null }) {
  return (
    <span
      className="inline-flex h-3 w-3 rounded-full border border-black/10"
      style={{ backgroundColor: color ?? "#cbd5e1" }}
      aria-label="Cor da categoria"
      title="Cor da categoria"
    />
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function toStatusTag(
  status: TransactionStatus,
): "PAID" | "PENDING" | "SKIPPED" {
  if (status === "PAID") return "PAID";
  if (status === "SKIPPED") return "SKIPPED";
  return "PENDING";
}
