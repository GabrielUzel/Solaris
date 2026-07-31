import { useState } from "react";
import Button from "../components/Button";

type TransferType = "current" | "planned";

export default function Dashboard() {
  const [transferType, setTransferType] = useState<TransferType>("current");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary-text">Resumo do mês atual</p>
      </div>
      {/*TODO: implementar isso de maneira certa */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Receitas previstas" value="R$ —" />
        <SummaryCard label="Despesas previstas" value="R$ —" />
        <SummaryCard label="Saldo esperado" value="R$ —" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-primary-border bg-card-background p-5 shadow-default">
        <h2 className="text-sm font-semibold text-primary-text">Análise</h2>
        <div className="flex h-40 items-center justify-center rounded-lg bg-secondary-background text-sm text-secondary-text">
          Gráficos em breve
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-primary-border bg-card-background p-5 shadow-default">
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

        <Button className="self-start">Adicionar</Button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-primary-border bg-card-background p-4 shadow-default">
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
    <Button
      onClick={onClick}
      variant={active ? "secondary" : "ghost"}
      className={active ? "border border-focus-border text-primary" : ""}
    >
      {children}
    </Button>
  );
}
