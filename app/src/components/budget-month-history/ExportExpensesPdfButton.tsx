import { useState } from "react";
import Button from "../Button";
import { useToast } from "../Toast";
import generateExpensesReportPdf from "../../utils/generate-expenses-report-pdf";

export default function ExportExpensesPdfButton() {
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  async function handleExport() {
    setExporting(true);

    try {
      const fileName = await generateExpensesReportPdf();
      showToast(`Relatório ${fileName} exportado com sucesso.`, "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível exportar o relatório.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button type="button" onClick={handleExport} disabled={exporting}>
      {exporting && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-inverted-text/40 border-t-inverted-text"
        />
      )}
      {exporting ? "Exportando..." : "Exportar PDF"}
    </Button>
  );
}
