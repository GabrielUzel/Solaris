import { useEffect, useRef, useState } from "react";
import Spinner from "../components/Spinner";
import ManualTransactionDrawer from "../components/budget-month/ManualTransactionDrawer";
import PlannedTransactionDrawer from "../components/planned-transactions/PlannedTransactionDrawer";
import PlannedTransactionEditDrawer from "../components/planned-transactions/PlannedTransactionEditDrawer";
import TransactionEditDrawer from "../components/budget-month/TransactionEditDrawer";
import BudgetMonthSummaryCards from "../components/budget-month/BudgetMonthSummaryCards";
import BudgetMonthTransactionsCard from "../components/budget-month/BudgetMonthTransactionsCard";
import PlannedTransactionsCard from "../components/planned-transactions/PlannedTransactionsCard";
import DeleteManualTransactionModal from "../components/budget-month/DeleteManualTransactionModal";
import DeletePlannedTransactionModal from "../components/planned-transactions/DeletePlannedTransactionModal";
import type {
  BudgetMonthTransaction,
  BudgetMonthTransactionFilters,
} from "../api/types/budget-month";
import type { PlannedTransaction } from "../api/types/planned-transaction";
import {
  useGetBudgetMonthSummary,
  useListBudgetMonthTransactions,
  useEnsureCurrentBudgetMonth,
  usePayTransaction,
  useDeleteManualTransaction,
} from "../hooks/budget-month";
import {
  useListActivePlannedTransactions,
  useDeletePlannedTransaction,
  useDeactivatePlannedTransaction,
  useReactivatePlannedTransaction,
} from "../hooks/planned-transaction";
import { useToast } from "../components/Toast";

export default function Dashboard() {
  const [showManualCreateDrawer, setShowManualCreateDrawer] = useState(false);
  const [showPlannedCreateDrawer, setShowPlannedCreateDrawer] = useState(false);
  const [selectedEditTransaction, setSelectedEditTransaction] =
    useState<BudgetMonthTransaction | null>(null);
  const [selectedDeleteTransaction, setSelectedDeleteTransaction] =
    useState<BudgetMonthTransaction | null>(null);
  const [selectedEditPlanned, setSelectedEditPlanned] =
    useState<PlannedTransaction | null>(null);
  const [selectedDeletePlanned, setSelectedDeletePlanned] =
    useState<PlannedTransaction | null>(null);
  const [budgetMonthFilters, setBudgetMonthFilters] =
    useState<BudgetMonthTransactionFilters>({});
  const [hasLoadedTransactionsOnce, setHasLoadedTransactionsOnce] =
    useState(false);
  const hasBootstrappedRef = useRef(false);

  const [
    ensureCurrentBudgetMonth,
    {
      data: ensuredMonthData,
      loading: ensureLoading,
      error: ensureError,
      called: ensureCalled,
    },
  ] = useEnsureCurrentBudgetMonth();

  const [payTransaction] = usePayTransaction();
  const [deleteManualTransaction] = useDeleteManualTransaction();
  const [deletePlannedTransaction] = useDeletePlannedTransaction();
  const [deactivatePlannedTransaction] = useDeactivatePlannedTransaction();
  const [reactivatePlannedTransaction] = useReactivatePlannedTransaction();
  const { showToast } = useToast();

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;
    void ensureCurrentBudgetMonth();
  }, [ensureCurrentBudgetMonth]);

  const currentBudgetMonth = ensuredMonthData?.ensureCurrentBudgetMonth ?? null;
  const budgetMonthId = currentBudgetMonth?.id;

  const {
    data: summaryData,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetBudgetMonthSummary(budgetMonthId);

  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useListBudgetMonthTransactions(budgetMonthId, budgetMonthFilters);

  const {
    data: plannedTransactionsData,
    loading: plannedLoading,
    error: plannedError,
    refetch: refetchPlanned,
  } = useListActivePlannedTransactions();

  useEffect(() => {
    if (transactionsData) setHasLoadedTransactionsOnce(true);
  }, [transactionsData]);

  const summary = summaryData?.getBudgetMonthSummary ?? null;
  const transactions = transactionsData?.listBudgetMonthTransactions ?? [];
  const plannedTransactions =
    plannedTransactionsData?.listActivePlannedTransactions ?? [];

  const hasBudgetMonth = Boolean(currentBudgetMonth);
  const isBootstrapping = !ensureCalled || ensureLoading;
  const isLoading =
    isBootstrapping ||
    (hasBudgetMonth && summaryLoading && !summaryData) ||
    (hasBudgetMonth && transactionsLoading && !hasLoadedTransactionsOnce) ||
    plannedLoading;

  const hasError =
    Boolean(ensureError) ||
    (hasBudgetMonth && (Boolean(summaryError) || Boolean(transactionsError))) ||
    Boolean(plannedError);

  useEffect(() => {
    if (ensureError) console.error("[Dashboard] ensureError:", ensureError);
    if (summaryError) console.error("[Dashboard] summaryError:", summaryError);
    if (transactionsError)
      console.error("[Dashboard] transactionsError:", transactionsError);
    if (plannedError) console.error("[Dashboard] plannedError:", plannedError);
  }, [ensureError, summaryError, transactionsError, plannedError]);

  async function refetchBudgetMonthData() {
    await Promise.all([refetchSummary(), refetchTransactions()]);
  }

  async function refetchPlannedData() {
    await refetchPlanned();
  }

  async function handleManualTransactionCreated() {
    await refetchBudgetMonthData();
  }

  async function handlePlannedTransactionCreated() {
    await refetchPlannedData();
  }

  async function handleTransactionUpdated() {
    setSelectedEditTransaction(null);
    await refetchBudgetMonthData();
  }

  async function handlePlannedTransactionUpdated() {
    setSelectedEditPlanned(null);
    await Promise.all([refetchPlannedData(), refetchBudgetMonthData()]);
  }

  async function handlePayTransaction(transaction: BudgetMonthTransaction) {
    if (!budgetMonthId) return;

    try {
      await payTransaction({
        variables: {
          budgetMonthId,
          transactionId: transaction.id,
        },
      });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível pagar a transação.",
      );
      return;
    }

    await refetchBudgetMonthData();
  }

  async function handleDeleteTransaction(transaction: BudgetMonthTransaction) {
    setSelectedDeleteTransaction(transaction);
  }

  async function confirmDeleteTransaction() {
    if (!budgetMonthId || !selectedDeleteTransaction) return;

    try {
      await deleteManualTransaction({
        variables: {
          budgetMonthId,
          transactionId: selectedDeleteTransaction.id,
        },
      });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível excluir o lançamento.",
      );
      return;
    }

    setSelectedDeleteTransaction(null);
    await refetchBudgetMonthData();
  }

  function handleEditTransaction(transaction: BudgetMonthTransaction) {
    setSelectedEditTransaction(transaction);
  }

  function handleEditPlanned(transaction: PlannedTransaction) {
    setSelectedEditPlanned(transaction);
  }

  function handleDeletePlanned(transaction: PlannedTransaction) {
    setSelectedDeletePlanned(transaction);
  }

  async function confirmDeletePlanned() {
    if (!selectedDeletePlanned) return;

    try {
      await deletePlannedTransaction({
        variables: { id: selectedDeletePlanned.id },
      });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o lançamento planejado.",
      );
      return;
    }

    setSelectedDeletePlanned(null);
    await refetchPlannedData();
  }

  async function handleDeactivatePlanned(transaction: PlannedTransaction) {
    try {
      await deactivatePlannedTransaction({
        variables: { id: transaction.id },
      });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível desativar o lançamento planejado.",
      );
      return;
    }
    await refetchPlannedData();
  }

  async function handleReactivatePlanned(transaction: PlannedTransaction) {
    try {
      await reactivatePlannedTransaction({
        variables: { id: transaction.id },
      });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível reativar o lançamento planejado.",
      );
      return;
    }
    await refetchPlannedData();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Dashboard</h1>
      </div>

      <ManualTransactionDrawer
        open={showManualCreateDrawer}
        onClose={() => setShowManualCreateDrawer(false)}
        budgetMonthId={budgetMonthId ?? null}
        onSuccess={handleManualTransactionCreated}
      />

      <PlannedTransactionDrawer
        open={showPlannedCreateDrawer}
        onClose={() => setShowPlannedCreateDrawer(false)}
        onSuccess={handlePlannedTransactionCreated}
      />

      <TransactionEditDrawer
        open={Boolean(selectedEditTransaction)}
        transaction={selectedEditTransaction}
        budgetMonthId={budgetMonthId ?? null}
        onClose={() => setSelectedEditTransaction(null)}
        onSuccess={handleTransactionUpdated}
      />

      <PlannedTransactionEditDrawer
        open={Boolean(selectedEditPlanned)}
        transaction={selectedEditPlanned}
        onClose={() => setSelectedEditPlanned(null)}
        onSuccess={handlePlannedTransactionUpdated}
      />

      <DeleteManualTransactionModal
        open={Boolean(selectedDeleteTransaction)}
        transaction={selectedDeleteTransaction}
        onClose={() => setSelectedDeleteTransaction(null)}
        onConfirm={confirmDeleteTransaction}
      />

      <DeletePlannedTransactionModal
        open={Boolean(selectedDeletePlanned)}
        transaction={selectedDeletePlanned}
        onClose={() => setSelectedDeletePlanned(null)}
        onConfirm={confirmDeletePlanned}
      />

      {isLoading ? (
        <Spinner />
      ) : hasError ? (
        <div className="rounded-xl border border-primary-border bg-card-background p-5 text-sm text-error shadow-default">
          Erro ao carregar os dados do mês.
        </div>
      ) : (
        <>
          <BudgetMonthSummaryCards summary={summary} />

          <div className="flex flex-col gap-3 rounded-xl border border-primary-border bg-card-background p-5 shadow-default">
            <h2 className="text-sm font-semibold text-primary-text">Análise</h2>
            <div className="flex h-40 items-center justify-center rounded-lg bg-secondary-background text-sm text-secondary-text">
              Gráficos em breve
            </div>
          </div>

          <BudgetMonthTransactionsCard
            hasBudgetMonth={hasBudgetMonth}
            transactions={transactions}
            onAdd={() => setShowManualCreateDrawer(true)}
            onEdit={handleEditTransaction}
            onPay={handlePayTransaction}
            onDelete={handleDeleteTransaction}
            referenceYear={currentBudgetMonth?.referenceYear}
            referenceMonth={currentBudgetMonth?.referenceMonth}
            filters={budgetMonthFilters}
            onFiltersChange={setBudgetMonthFilters}
          />

          <PlannedTransactionsCard
            transactions={plannedTransactions}
            onAdd={() => setShowPlannedCreateDrawer(true)}
            onEdit={handleEditPlanned}
            onDelete={handleDeletePlanned}
            onDeactivate={handleDeactivatePlanned}
            onReactivate={handleReactivatePlanned}
          />
        </>
      )}
    </div>
  );
}
