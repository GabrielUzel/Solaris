import Button from "../Button";
import type { CreditCard } from "../../api/types/credit-card";

type Props = {
  open: boolean;
  card: CreditCard | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function DeactivateCreditCardModal({
  open,
  card,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  if (!open || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        className="absolute inset-0 animate-overlay-fade bg-black/50"
        aria-label="Fechar confirmação"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md animate-modal-pop rounded-2xl border border-primary-border bg-card-background shadow-2xl">
        <div className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-primary-text">
              Desativar cartão
            </h2>
            <p className="mt-2 text-sm text-secondary-text">
              Tem certeza que deseja desativar o cartão{" "}
              <span className="font-medium text-primary-text">{card.name}</span>
              ? Os lançamentos existentes continuarão visíveis nas faturas, mas
              o cartão não poderá ser usado em novas compras.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={onConfirm}
              disabled={loading}
            >
              Desativar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
