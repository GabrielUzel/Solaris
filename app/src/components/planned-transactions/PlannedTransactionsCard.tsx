import Button from "../Button";
import Plus from "../../assets/icons/plus.svg?react";
import Edit from "../../assets/icons/edit.svg?react";
import Trash from "../../assets/icons/trash.svg?react";
import Check from "../../assets/icons/check.svg?react";
import StatusTag from "../StatusTag";
import type { PlannedTransaction } from "../../api/types/planned-transaction";
import formatCurrency from "../../utils/formatCurrency";

type Props = {
  transactions: PlannedTransaction[];
  onAdd: () => void;
  onEdit: (transaction: PlannedTransaction) => void;
  onDelete: (transaction: PlannedTransaction) => void;
  onDeactivate: (transaction: PlannedTransaction) => void;
  onReactivate: (transaction: PlannedTransaction) => void;
};

export default function PlannedTransactionsCard({
  transactions,
  onAdd,
  onEdit,
  onDelete,
  onDeactivate,
  onReactivate,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary-border bg-card-background p-5 shadow-default">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-primary-text">
            Lançamentos planejados
          </h2>
          <span className="text-xs text-secondary-text">
            {transactions.length} itens
          </span>
        </div>

        <Button
          variant="primary"
          onClick={onAdd}
          aria-label="Adicionar lançamento planejado"
          title="Adicionar lançamento planejado"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo planejado
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-lg bg-secondary-background px-4 py-6 text-sm text-secondary-text">
          Nenhum lançamento planejado cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-primary-border">
          <table className="w-full table-fixed">
            <thead className="bg-secondary-background">
              <tr className="text-left text-xs font-medium text-secondary-text">
                <th className="w-[28%] px-4 py-3">Descrição</th>
                <th className="w-[10%] px-2 py-3">Status</th>
                <th className="w-[10%] px-2 py-3">Tipo</th>
                <th className="w-[8%] px-2 py-3">Dia</th>
                <th className="w-[16%] px-2 py-3">Categoria</th>
                <th className="w-[13%] px-2 py-3 text-right">Valor</th>
                <th className="w-[15%] px-3 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-primary-border">
              {transactions.map((transaction) => (
                <PlannedTransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDeactivate={onDeactivate}
                  onReactivate={onReactivate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PlannedTransactionRow({
  transaction,
  onEdit,
  onDelete,
  onDeactivate,
  onReactivate,
}: {
  transaction: PlannedTransaction;
  onEdit: (transaction: PlannedTransaction) => void;
  onDelete: (transaction: PlannedTransaction) => void;
  onDeactivate: (transaction: PlannedTransaction) => void;
  onReactivate: (transaction: PlannedTransaction) => void;
}) {
  function stopPropagation(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <tr className="bg-card-background transition-colors hover:bg-hover-background/40">
      <td className="px-4 py-3 align-middle">
        <span className="truncate text-sm font-medium text-primary-text">
          {transaction.description}
        </span>
      </td>

      <td className="px-2 py-3 align-middle">
        <StatusTag status={transaction.active ? "ACTIVE" : "INACTIVE"} />
      </td>

      <td className="px-2 py-3 align-middle text-sm text-secondary-text">
        {transaction.type === "INCOME" ? "Receita" : "Despesa"}
      </td>

      <td className="px-2 py-3 align-middle text-sm text-secondary-text">
        {transaction.dayOfMonth}
      </td>

      <td className="px-2 py-3 align-middle">
        <div className="flex items-center gap-1.5">
          {transaction.categoryColor ? (
            <span
              className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: transaction.categoryColor }}
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate text-sm text-secondary-text">
            {transaction.categoryName ?? "—"}
          </span>
        </div>
      </td>

      <td
        className={`px-2 py-3 align-middle text-right text-sm font-semibold ${
          transaction.type === "INCOME" ? "text-success" : "text-error"
        }`}
      >
        {transaction.type === "INCOME" ? "+" : "-"}{" "}
        {formatCurrency(transaction.amount)}
      </td>

      <td className="px-3 py-3 align-middle">
        <div
          className="flex items-center justify-end gap-1 whitespace-nowrap"
          onClick={stopPropagation}
        >
          <IconActionButton
            label="Editar lançamento planejado"
            title="Editar lançamento planejado"
            onClick={() => onEdit(transaction)}
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
          </IconActionButton>

          {transaction.active ? (
            <IconActionButton
              label="Desativar lançamento planejado"
              title="Desativar"
              onClick={() => onDeactivate(transaction)}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </IconActionButton>
          ) : (
            <IconActionButton
              label="Reativar lançamento planejado"
              title="Reativar"
              onClick={() => onReactivate(transaction)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </IconActionButton>
          )}

          <IconActionButton
            label="Excluir lançamento planejado"
            title="Excluir"
            onClick={() => onDelete(transaction)}
            className="text-error"
          >
            <Trash className="h-4 w-4" aria-hidden="true" />
          </IconActionButton>
        </div>
      </td>
    </tr>
  );
}

function IconActionButton({
  label,
  title,
  onClick,
  className = "",
  children,
}: {
  label: string;
  title: string;
  onClick: () => void;
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
    >
      {children}
    </Button>
  );
}
