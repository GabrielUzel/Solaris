type Props = {
  label?: string;
  className?: string;
};

export default function Spinner({
  label = "Carregando...",
  className = "",
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center py-16"
    >
      <div
        className={[
          "h-6 w-6 animate-spin rounded-full border-2 border-primary-border border-t-focus-border",
          className,
        ].join(" ")}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
