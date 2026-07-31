import { useState } from "react";

type TransferType = "current" | "planned";

export default function Dashboard() {
  const [transferType, setTransferType] = useState<TransferType>("current");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Dashboard</h1>
        <p className="text-sm text-secondary-text mt-1">Resumo do mês atual</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Receitas previstas" value="R$ —" />
        <SummaryCard label="Despesas previstas" value="R$ —" />
        <SummaryCard label="Saldo esperado" value="R$ —" />
      </div>

      <div className="flex flex-col gap-3 bg-card-background rounded-xl p-5 border border-primary-border shadow-default">
        <h2 className="text-sm font-semibold text-primary-text">
          Adicionar lançamento
        </h2>

        <div className="flex gap-2">
          <TypeButton
            active={transferType === "current"}
            onClick={() => setTransferType("current")}
          >
            Mês atual
          </TypeButton>
          <TypeButton
            active={transferType === "planned"}
            onClick={() => setTransferType("planned")}
          >
            Planejado
          </TypeButton>
        </div>

        <p className="text-xs text-secondary-text">
          {transferType === "current"
            ? "Adicione uma transação avulsa para o mês corrente."
            : "Crie um lançamento recorrente que aparecerá nos próximos meses."}
        </p>

        <button className="self-start px-4 py-2 rounded-lg text-sm font-medium text-inverted-text bg-button-background hover:bg-button-hover transition-colors">
          Adicionar
        </button>
      </div>

      <div className="flex flex-col gap-3 bg-card-background rounded-xl p-5 border border-primary-border shadow-default">
        <h2 className="text-sm font-semibold text-primary-text">Análise</h2>
        <div className="flex items-center justify-center h-40 rounded-lg bg-secondary-background text-secondary-text text-sm">
          Gráficos em breve
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-card-background rounded-xl p-4 border border-primary-border shadow-default">
      <span className="text-xs text-secondary-text">{label}</span>
      <span className="text-lg font-semibold text-primary-text">{value}</span>
    </div>
  );
}

function TypeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
        active
          ? "bg-badge-background text-primary border border-focus-border"
          : "bg-input-background text-secondary-text hover:bg-hover-background",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
