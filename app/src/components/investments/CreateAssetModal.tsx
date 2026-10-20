import { FormEvent, useEffect, useState } from "react";
import Button from "../Button";
import { useCreateAsset, useValidateAssetTicker } from "../../hooks/useAssetSearch";
import CreateAssetFields, {
  assetFormToInput,
  emptyAssetForm,
  isAssetFormValid,
  type AssetFormValue,
} from "./CreateAssetFields";
import { InlineError, ModalShell } from "./ReinvestmentModal";
import { useToast } from "../Toast";

type TickerStatus = "idle" | "verifying" | "valid" | "invalid";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateAssetModal({ open, onClose }: Props) {
  const { showToast } = useToast();
  const [createAsset, { loading, error }] = useCreateAsset();
  const [validateTicker, { loading: validating }] = useValidateAssetTicker();
  const [form, setForm] = useState<AssetFormValue>(emptyAssetForm());
  const [tickerStatus, setTickerStatus] = useState<TickerStatus>("idle");

  useEffect(() => {
    if (!open) return;
    setForm(emptyAssetForm());
    setTickerStatus("idle");
  }, [open]);

  if (!open) return null;

  const isFixedIncome = form.assetType === "FIXED_INCOME";
  const needsValidation = !isFixedIncome;
  const tickerValidated = !needsValidation || tickerStatus === "valid";
  const canSubmit =
    isAssetFormValid(form) && !loading && tickerValidated;

  async function handleVerifyTicker() {
    if (form.ticker.trim() === "") return;

    setTickerStatus("verifying");

    const input = assetFormToInput(form);
    try {
      const result = await validateTicker({
        variables: {
          input: {
            ticker: input.ticker ?? "",
            assetType: input.assetType,
            market: input.market,
            priceSource: input.priceSource,
            externalSymbol: input.externalSymbol,
          },
        },
      });

      if (result.data?.validateAssetTicker.valid) {
        setTickerStatus("valid");
        showToast("Ticker validado com sucesso.", "success");
      } else {
        setTickerStatus("invalid");
        showToast(result.error?.message ?? "Ticker não encontrado.");
      }
    } catch (err) {
      setTickerStatus("invalid");
      showToast(
        err instanceof Error ? err.message : "Não foi possível validar o ticker.",
      );
    }
  }

  function handleFormChange(next: AssetFormValue) {
    if (next.ticker !== form.ticker || next.market !== form.market ||
        next.assetType !== form.assetType || next.priceSource !== form.priceSource ||
        next.externalSymbol !== form.externalSymbol) {
    setTickerStatus("idle");
    }
    setForm(next);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    if (needsValidation && tickerStatus !== "valid") {
      showToast("Verifique o ticker antes de cadastrar o ativo.");
      return;
    }

    try {
      await createAsset({ variables: { input: assetFormToInput(form) } });
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível cadastrar o ativo.",
      );
    }
  }

  return (
    <ModalShell title="Novo ativo" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <CreateAssetFields
          value={form}
          onChange={handleFormChange}
          onVerifyTicker={handleVerifyTicker}
          validating={validating}
        />

        {error && <InlineError message={error.message} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {loading ? "Cadastrando..." : "Cadastrar ativo"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
