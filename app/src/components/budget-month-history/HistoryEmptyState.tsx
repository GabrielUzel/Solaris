type Props = {
  message: string;
};

export default function HistoryEmptyState({ message }: Props) {
  return (
    <div className="rounded-lg border border-primary-border bg-card-background px-4 py-8 text-center text-sm text-secondary-text">
      {message}
    </div>
  );
}
