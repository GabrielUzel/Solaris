import { FormEvent, useEffect, useRef, useState } from "react";
import Button from "../Button";
import MoneyInput from "../MoneyInput";
import { useAssetSearch } from "../../hooks/useAssetSearch";
import { useCreateInvestment } from "../../hooks/useInvestments";
import type { Asset } from "../../api/investments/types";
import { assetTypeLabels } from "./labels";
import QuantityStepper from "./QuantityStepper";
import DateInput from "../DateInput";
import { Field, getToday, ModalShell } from "./ReinvestmentModal";
import { useToast } from "../Toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateInvestmentModal({ open, onClose }: Props) {
  const { showToast } = useToast();
  const [createInvestment, { loading: creatingInvestment }] =
    useCreateInvestment();

  const [search, setSearch] = useState("");
  const { assets, loading: searching } = useAssetSearch(search);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [amountCents, setAmountCents] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [transactionDate, setTransactionDate] = useState(getToday());

  const searchRootRef = useRef<HTMLDivElement>(null);
  const loading = creatingInvestment;

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setDropdownOpen(false);
    setSelectedAsset(null);
    setAmountCents(0);
    setQuantity("");
    setTransactionDate(getToday());
  }, [open]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!searchRootRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!open) return null;

  const hasSearchTerm = search.trim() !== "";
  const showEmptySearch =
    hasSearchTerm && !searching && assets.length === 0 && !selectedAsset;
  const assetResolved = selectedAsset != null;

  function handleSelectAsset(asset: Asset) {
    setSelectedAsset(asset);
    setSearch("");
    setDropdownOpen(false);
  }

  function handleResetAsset() {
    setSelectedAsset(null);
    setSearch("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const asset = selectedAsset;

    if (!asset) {
      showToast("Selecione um ativo para continuar.");
      return;
    }

    if (amountCents <= 0 || transactionDate === "") {
      showToast("Informe o valor investido e a data da transação.");
      return;
    }

    const parsedQuantity = parseFloat(quantity.replace(",", "."));

    try {
      await createInvestment({
        variables: {
          input: {
            assetId: asset.id,
            amountInvestedCents: amountCents,
            quantity:
              quantity.trim() !== "" && !isNaN(parsedQuantity)
                ? parsedQuantity
                : null,
            transactionDate,
          },
        },
      });

      onClose();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o investimento.",
      );
    }
  }

  return (
    <ModalShell title="Novo investimento" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Ativo">
          {assetResolved ? (
            <div className="flex items-center justify-between rounded-lg border border-primary-border bg-input-background px-3 py-2">
              <div>
                <p className="text-sm font-medium text-primary-text">
                  {selectedAsset.ticker}
                </p>
                <p className="text-xs text-secondary-text">
                  {selectedAsset.name} ·{" "}
                  {assetTypeLabels[selectedAsset.assetType]}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAsset}
                className="text-xs font-medium text-primary hover:underline"
              >
                Trocar
              </button>
            </div>
          ) : (
            <div ref={searchRootRef} className="relative">
              <input
                type="text"
                value={search}
                placeholder="Buscar por ticker ou nome..."
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                className="w-full rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />

              {dropdownOpen && hasSearchTerm && (
                <div
                  role="listbox"
                  className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-primary-border bg-card-background shadow-2xl"
                >
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelectAsset(asset)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-primary-text hover:bg-hover-background"
                    >
                      <span>
                        <span className="font-medium">{asset.ticker}</span>{" "}
                        <span className="text-secondary-text">
                          {asset.name}
                        </span>
                      </span>
                      <span className="text-xs text-secondary-text">
                        {assetTypeLabels[asset.assetType]}
                      </span>
                    </button>
                  ))}

                  {showEmptySearch && (
                    <p className="border-t border-primary-border px-3 py-2 text-xs text-secondary-text">
                      Nenhum ativo encontrado. Cadastre-o antes na seção
                      &quot;Ativos cadastrados&quot; da página.
                    </p>
                  )}

                  {searching && (
                    <p className="px-3 py-2 text-xs text-secondary-text">
                      Buscando ativos...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Field>

        {assetResolved && (
          <>
            <Field label="Valor investido">
              <MoneyInput value={amountCents} onChange={setAmountCents} />
            </Field>

            <Field label="Quantidade (opcional)">
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </Field>

            <Field label="Data da transação">
              <DateInput
                value={transactionDate}
                onChange={setTransactionDate}
              />
            </Field>

          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !assetResolved}>
            {loading ? "Criando investimento..." : "Criar investimento"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
