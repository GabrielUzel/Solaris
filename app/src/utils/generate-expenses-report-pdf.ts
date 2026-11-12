import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import client from "../api/apollo";
import {
  LIST_CLOSED_BUDGET_MONTHS_BY_YEAR,
  LIST_YEARS_WITH_CLOSED_BUDGET_MONTHS,
  type ListClosedBudgetMonthsByYearData,
  type ListClosedBudgetMonthsByYearVars,
  type ListYearsWithClosedBudgetMonthsData,
} from "../api/budget-month-history";
import type {
  BudgetMonthTransaction,
  ClosedBudgetMonthReport,
} from "../api/types/budget-month";
import type { PaymentMethod } from "../api/types/common";
import formatCurrency from "./formatCurrency";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  BANK_TRANSFER: "Transferência",
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
};

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const PAGE_MARGIN = 14;

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Fora do Tauri (por exemplo `bun run dev` no navegador) não existe o bridge
 * nativo, então o PDF é entregue pelo download padrão do navegador.
 */
function downloadInBrowser(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function savePdf(bytes: Uint8Array, fileName: string) {
  if (!isTauriRuntime()) {
    downloadInBrowser(bytes, fileName);
    return;
  }

  const [{ writeFile }, { downloadDir }] = await Promise.all([
    import("@tauri-apps/plugin-fs"),
    import("@tauri-apps/api/path"),
  ]);

  const downloadsPath = await downloadDir();
  await writeFile(`${downloadsPath}/${fileName}`, bytes);
}

function formatSignedAmount(transaction: BudgetMonthTransaction) {
  const amount = transaction.actualAmount ?? transaction.expectedAmount;
  const sign = transaction.type === "INCOME" ? "+" : "-";
  return `${sign} ${formatCurrency(amount)}`;
}

async function fetchAllClosedMonths(): Promise<ClosedBudgetMonthReport[]> {
  const yearsResult = await client.query<ListYearsWithClosedBudgetMonthsData>({
    query: LIST_YEARS_WITH_CLOSED_BUDGET_MONTHS,
    fetchPolicy: "network-only",
  });

  const years = [...(yearsResult.data?.listYearsWithClosedBudgetMonths ?? [])].sort(
    (a, b) => a - b,
  );

  const allMonths: ClosedBudgetMonthReport[] = [];

  for (const year of years) {
    const result = await client.query<
      ListClosedBudgetMonthsByYearData,
      ListClosedBudgetMonthsByYearVars
    >({
      query: LIST_CLOSED_BUDGET_MONTHS_BY_YEAR,
      variables: { year },
      fetchPolicy: "network-only",
    });

    allMonths.push(...(result.data?.listClosedBudgetMonthsByYear ?? []));
  }

  return allMonths;
}

function groupMonthsByYear(months: ClosedBudgetMonthReport[]) {
  const byYear = new Map<number, ClosedBudgetMonthReport[]>();

  for (const month of months) {
    const list = byYear.get(month.referenceYear) ?? [];
    list.push(month);
    byYear.set(month.referenceYear, list);
  }

  return [...byYear.entries()]
    .sort(([yearA], [yearB]) => yearA - yearB)
    .map(
      ([year, yearMonths]) =>
        [
          year,
          [...yearMonths].sort((a, b) => a.referenceMonth - b.referenceMonth),
        ] as const,
    );
}

export default async function generateExpensesReportPdf(): Promise<string> {
  const closedMonths = await fetchAllClosedMonths();

  if (closedMonths.length === 0) {
    throw new Error("Não há meses fechados para exportar.");
  }

  const doc = new jsPDF();
  const currentYear = new Date().getFullYear();

  doc.setFontSize(18);
  doc.text(`Relatório de Gastos - ${currentYear}`, PAGE_MARGIN, PAGE_MARGIN + 4);

  let cursorY = PAGE_MARGIN + 14;

  for (const [year, months] of groupMonthsByYear(closedMonths)) {
    doc.setFontSize(15);
    doc.text(String(year), PAGE_MARGIN, cursorY);
    cursorY += 6;

    for (const report of months) {
      doc.setFontSize(12);
      doc.text(
        MONTH_NAMES[report.referenceMonth - 1] ?? `Mês ${report.referenceMonth}`,
        PAGE_MARGIN,
        cursorY,
      );
      cursorY += 5;

      doc.setFontSize(9);
      doc.text(
        `Receitas: ${formatCurrency(report.incomeTotal)}    Despesas: ${formatCurrency(report.expenseTotal)}    Balanço: ${formatCurrency(report.balance)}    Transações: ${report.transactionCount}`,
        PAGE_MARGIN,
        cursorY,
      );
      cursorY += 2;

      autoTable(doc, {
        startY: cursorY,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        head: [
          [
            "Data",
            "Descrição",
            "Categoria",
            "Tipo",
            "Método",
            "Valor",
            "Origem",
          ],
        ],
        body: report.transactions.map((transaction) => [
          formatDate(transaction.occurredOn),
          transaction.description,
          transaction.categoryName ?? "—",
          transaction.type === "INCOME" ? "Receita" : "Despesa",
          PAYMENT_METHOD_LABELS[transaction.paymentMethod] ??
            transaction.paymentMethod,
          formatSignedAmount(transaction),
          transaction.origin === "PLANNED" ? "Planejado" : "Manual",
        ]),
        styles: { fontSize: 8 },
        headStyles: { fontSize: 8 },
        columnStyles: {
          5: { halign: "right" },
        },
      });

      cursorY = (doc as jsPDF & { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY + 8;

      if (cursorY > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        cursorY = PAGE_MARGIN;
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const fileName = `relatorio_gastos_${today}.pdf`;

  await savePdf(new Uint8Array(doc.output("arraybuffer")), fileName);

  return fileName;
}
