import { useTransactions } from "../../../hooks/transactions/@shared/use-transactions";
import { useTransactionFilter } from "../../../hooks/transactions/@shared/use-transaction-filter";
import { TransactionFilters } from "./transactions-filters";
import { TransactionsTable } from "./transactions-table";

export default function Transactions() {
  const { filter, setFilter } = useTransactionFilter();
  const { data, isLoading } = useTransactions(filter);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg">Transações</h1>
      <TransactionFilters filter={filter} onChange={setFilter} />
      <TransactionsTable data={data} isLoading={isLoading} />
    </div>
  );
}
