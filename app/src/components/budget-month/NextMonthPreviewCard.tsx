import Button from "../Button";
import { useNextUnopenedBudgetMonth } from "../../hooks/use-next-unopened-budget-month";
import { useBudgetMonthPreview } from "../../hooks/use-budget-month-preview";
import formatMonthYear from "../../utils/formatMonthYear";
import NextMonthPreviewSummary from "./NextMonthPreviewSummary";
import NextMonthPreviewTransactionsCompact from "./NextMonthPreviewTransactionsCompact";

const skeleton = (
  <>
    <div className="h-4 w-48 animate-pulse rounded bg-input-background" />
    <div className="flex-1 animate-pulse rounded-lg bg-input-background" />
  </>
);

const emptyState = (
  <div className="flex items-center justify-center rounded-lg bg-secondary-background px-4 py-6 text-center text-sm text-secondary-text">
    Nenhuma transação planejada para este mês.
  </div>
);

export default function NextMonthPreviewCard() {
  const {
    data: reference,
    loading: referenceLoading,
    error: referenceError,
    refetch: refetchReference,
  } = useNextUnopenedBudgetMonth();

  const {
    preview,
    loading: previewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = useBudgetMonthPreview(reference?.year, reference?.month);

  const showSkeleton =
    (referenceLoading && !reference) ||
    (Boolean(reference) && previewLoading && !preview);

  function handleRetry() {
    void refetchReference();
    if (reference) {
      void refetchPreview();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 rounded-2xl border border-primary-border bg-card-background p-5">
      {showSkeleton ? (
        skeleton
      ) : referenceError || previewError ? (
        <>
          <h2 className="text-sm font-semibold text-primary-text">
            Próximo mês
          </h2>
          <p className="text-sm text-secondary-text">
            Não foi possível carregar o preview do próximo mês.
          </p>
          <Button
            variant="secondary"
            onClick={handleRetry}
            className="self-start"
          >
            Tentar novamente
          </Button>
        </>
      ) : reference === null ? (
        <>
          <h2 className="text-sm font-semibold text-primary-text">
            Próximo mês
          </h2>
          {emptyState}
        </>
      ) : preview ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-primary-text">
              Próximo mês ·{" "}
              {formatMonthYear(preview.referenceYear, preview.referenceMonth)}
            </h2>
            <span className="text-xs text-secondary-text">
              {preview.summary.transactionCount} lançamentos
            </span>
          </div>
          <NextMonthPreviewSummary summary={preview.summary} />
          {preview.transactions.length === 0 ? (
            emptyState
          ) : (
            <NextMonthPreviewTransactionsCompact
              transactions={preview.transactions}
            />
          )}
        </>
      ) : (
        skeleton
      )}
    </div>
  );
}
