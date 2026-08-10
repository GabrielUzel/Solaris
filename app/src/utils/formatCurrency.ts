export default function formatCurrency(value?: number | null) {
  if (value == null) {
    return "R$ —";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}
