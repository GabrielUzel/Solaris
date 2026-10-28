type Props = {
  message?: string;
};

export default function AnalyticsEmptyState({
  message = "Nenhum dado financeiro no período selecionado.",
}: Props) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-secondary-background px-4 py-6 text-center text-sm text-secondary-text">
      {message}
    </div>
  );
}
