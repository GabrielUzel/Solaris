export default function formatPercent(value?: number | null) {
  if (value == null) {
    return "—";
  }

  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}
