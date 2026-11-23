import Button from "../Button";
import { useToast } from "../Toast";
import { useReactivateCreditCard } from "../../hooks/credit-card";
import type { CreditCard } from "../../api/types/credit-card";
import { getBank } from "../../utils/banks";

type Props = {
  open: boolean;
  onClose: () => void;
  cards: CreditCard[];
};

export default function DeactivatedCardsDrawer({
  open,
  onClose,
  cards,
}: Props) {
  const [reactivateCreditCard, { loading: reactivating }] =
    useReactivateCreditCard();
  const { showToast } = useToast();

  if (!open) return null;

  async function handleReactivate(card: CreditCard) {
    try {
      await reactivateCreditCard({ variables: { id: card.id } });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível reativar o cartão.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 animate-overlay-fade bg-black/50"
        aria-label="Fechar painel"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md animate-drawer-slide border-l border-primary-border bg-card-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              Cartões desativados
            </h2>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-secondary-text">
                <p>Nenhum cartão desativado.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-primary-border">
                {cards.map((card) => {
                  const bankInfo = getBank(card.bank);

                  return (
                    <div
                      key={card.id}
                      className="flex items-center justify-between gap-3 px-6 py-4"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm text-primary-text">
                          {card.name}
                        </span>
                        <span className="text-xs text-secondary-text">
                          {bankInfo.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={reactivating}
                        onClick={() => handleReactivate(card)}
                        className="shrink-0 text-xs text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Ativar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-4">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
