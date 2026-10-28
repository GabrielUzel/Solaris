export function getStartOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

export function getEndOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0);
}

export function addMonths(
  year: number,
  month: number,
  amount: number,
): { year: number; month: number } {
  const total = year * 12 + (month - 1) + amount;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function getLastNMonthsRange(n: number): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  const { year: startYear, month: startMonth } = addMonths(
    endYear,
    endMonth,
    -(n - 1),
  );

  const startDate = toISODate(getStartOfMonth(startYear, startMonth));
  const endDate = toISODate(getEndOfMonth(endYear, endMonth));

  return { startDate, endDate };
}

export function formatMonthLabel(year: number, month: number): string {
  const labels = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const shortYear = String(year % 100).padStart(2, "0");
  return `${labels[month - 1]}/${shortYear}`;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const FULL_MONTH_LABELS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatFullMonthYear(year: number, month: number): string {
  return `${FULL_MONTH_LABELS[month - 1]} de ${year}`;
}

export function formatAnalyticsRange(startDate: string, endDate: string): string {
  const [startYear, startMonth] = startDate.split("-").map(Number);
  const [endYear, endMonth] = endDate.split("-").map(Number);

  if (startYear === endYear && startMonth === endMonth) {
    return formatFullMonthYear(startYear, startMonth);
  }

  const start = formatFullMonthYear(startYear, startMonth);
  const end = formatFullMonthYear(endYear, endMonth);

  return `${start.charAt(0).toUpperCase() + start.slice(1)} a ${end}`;
}
