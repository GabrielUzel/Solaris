import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { useToast } from "../Toast";
import {
  useCreateCreditCard,
  useUpdateCreditCard,
} from "../../hooks/credit-card";
import type { CreditCard } from "../../api/types/credit-card";
import { BANKS } from "../../utils/banks";
import CreditCardVisual from "./CreditCardVisual";

type Props = {
  open: boolean;
  onClose: () => void;
  card?: CreditCard | null;
  onSuccess?: () => Promise<void> | void;
};

export default function CreditCardDrawer({
  open,
  onClose,
  card = null,
  onSuccess,
}: Props) {
  const [createCreditCard, { loading: creating }] = useCreateCreditCard();
  const [updateCreditCard, { loading: updating }] = useUpdateCreditCard();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [bank, setBank] = useState(BANKS[0].id);
  const [closingDay, setClosingDay] = useState("1");
  const [dueDay, setDueDay] = useState("10");

  const loading = creating || updating;
  const isEditing = Boolean(card);

  const bankOptions = useMemo(
    () => BANKS.map((item) => ({ label: item.name, value: item.id })),
    [],
  );

  useEffect(() => {
    if (!open) return;
    setName(card?.name ?? "");
    setBank(card?.bank ?? BANKS[0].id);
    setClosingDay(String(card?.closingDay ?? 1));
    setDueDay(String(card?.dueDay ?? 10));
  }, [open, card]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Informe o nome do cartão.");
      return;
    }

    const closing = Number(closingDay);
    const due = Number(dueDay);

    if (!Number.isInteger(closing) || closing < 1 || closing > 28) {
      showToast("O dia de fechamento deve estar entre 1 e 28.");
      return;
    }

    if (!Number.isInteger(due) || due < 1 || due > 28) {
      showToast("O dia de vencimento deve estar entre 1 e 28.");
      return;
    }

    try {
      if (card) {
        await updateCreditCard({
          variables: {
            id: card.id,
            input: {
              name: name.trim(),
              bank,
              closingDay: closing,
              dueDay: due,
            },
          },
        });
      } else {
        await createCreditCard({
          variables: {
            input: {
              name: name.trim(),
              bank,
              closingDay: closing,
              dueDay: due,
            },
          },
        });
      }
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o cartão.",
      );
      return;
    }

    await onSuccess?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 animate-overlay-fade bg-black/50"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md animate-drawer-slide border-l border-primary-border bg-card-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              {isEditing ? "Editar cartão" : "Novo cartão"}
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
          >
            <CreditCardVisual
              name={name || "Nome do cartão"}
              bank={bank}
              closingDay={Number(closingDay) || undefined}
              dueDay={Number(dueDay) || undefined}
            />

            <Field label="Nome">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />
            </Field>

            <Field label="Banco">
              <Dropdown
                label="Selecione o banco"
                value={bank}
                onChange={setBank}
                options={bankOptions}
              />
            </Field>

            <Field label="Dia de fechamento">
              <input
                type="number"
                min="1"
                max="28"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text [appearance:textfield] focus:border-focus-border focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Field>

            <Field label="Dia de vencimento">
              <input
                type="number"
                min="1"
                max="28"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text [appearance:textfield] focus:border-focus-border focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Field>

            <div className="mt-auto flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {isEditing ? "Salvar alterações" : "Adicionar cartão"}
              </Button>
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-secondary-text">{label}</label>
      {children}
    </div>
  );
}
