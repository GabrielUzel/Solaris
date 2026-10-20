type Props = {
  value: string;
  onChange: (value: string) => void;
};

const STEP = 1;

export default function QuantityStepper({ value, onChange }: Props) {
  const current = parseFloat(value.replace(",", "."));
  const currentValue = isNaN(current) ? 0 : current;

  function stepBy(delta: number) {
    const next = Math.max(0, currentValue + delta);
    // toFixed evita artefatos de ponto flutuante (ex.: 0.1 + 1 = 1.1000000000000001)
    onChange(String(Number(next.toFixed(8))));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Diminuir 1"
        onClick={() => stepBy(-STEP)}
        disabled={currentValue <= 0}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-border bg-card-background text-lg font-medium text-primary transition-colors hover:border-focus-border hover:bg-hover-background disabled:opacity-40 disabled:hover:border-primary-border disabled:hover:bg-card-background"
      >
        −
      </button>

      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-0 flex-1 rounded-lg border border-primary-border bg-input-background px-3 text-center text-sm text-primary-text focus:border-focus-border focus:outline-none"
      />

      <button
        type="button"
        aria-label="Aumentar 1"
        onClick={() => stepBy(STEP)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-border bg-card-background text-lg font-medium text-primary transition-colors hover:border-focus-border hover:bg-hover-background"
      >
        +
      </button>
    </div>
  );
}
