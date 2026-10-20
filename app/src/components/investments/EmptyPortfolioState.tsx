import Button from "../Button";
import InvestmentIcon from "../../assets/icons/investment.svg?react";

type Props = {
  onCreateClick: () => void;
};

export default function EmptyPortfolioState({ onCreateClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-primary-border bg-card-background px-6 py-16 text-center">
      <InvestmentIcon className="h-10 w-10 text-secondary-text" aria-hidden="true" />
      <div>
        <h2 className="text-base font-semibold text-primary-text">
          Nenhum investimento ainda
        </h2>
        <p className="mt-1 text-sm text-secondary-text">
          Cadastre sua primeira posição para acompanhar a evolução da sua
          carteira.
        </p>
      </div>
      <Button type="button" onClick={onCreateClick}>
        Novo investimento
      </Button>
    </div>
  );
}
