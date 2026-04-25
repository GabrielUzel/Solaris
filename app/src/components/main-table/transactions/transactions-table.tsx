import { TransactionResult } from "../../../hooks/transactions/@shared/use-transactions";
import { TransactionCard } from "./transaction-card";

type Row = {
  id: string;
  amount: number;
  type: string;
  date: string;
  description: string;
  category: string;
  account: string;
};

function normalize(data: TransactionResult | null | undefined): Row[] {
  if (!data) {
    return [];
  }

  const items = Array.isArray(data)
    ? data
    : "transactions" in data
      ? data.transactions
      : [];

  return (items as any[]).map((item) => ({
    id: item.id,
    amount: item.amount,
    type: item.type,
    date: item.date,
    description: item.description,
    category: item.categoryName ?? item.categoryId ?? "",
    account: item.accountName ?? item.accountId ?? "",
  }));
}

type Props = {
  data: TransactionResult | null | undefined;
  isLoading: boolean;
};

export function TransactionsTable({ data, isLoading }: Props) {
  if (isLoading) {
    return <p>Carregando...</p>; // TODO: Mudar isso depois
  }

  const rows = normalize(data);

  if (rows.length === 0) {
    return <p>Nenhuma transação encontrada.</p>; // TODO: Mudar isso depois
  }

  return (
    <div>
      {rows.map((row) => (
        <TransactionCard key={row.id} transaction={row} />
      ))}
    </div>
  );
}
