import { useState } from "react";
import type { ApiProvider } from "../../api/settings/types";
import { useDeleteApiKey, useSaveApiKey } from "../../hooks/useSettings";
import { useToast } from "../Toast";
import Button from "../Button";

type Props = {
  label: string;
  description: string;
  provider: ApiProvider;
  configured: boolean;
};

type FieldState = "idle" | "editing";

export default function ApiKeyField({
  label,
  description,
  provider,
  configured,
}: Props) {
  const [state, setState] = useState<FieldState>("idle");
  const [keyValue, setKeyValue] = useState("");

  const [saveApiKey, { loading: saving, error: saveError }] = useSaveApiKey();
  const [deleteApiKey, { loading: deleting }] = useDeleteApiKey();
  const { showToast } = useToast();

  function handleStartEdit() {
    setKeyValue("");
    setState("editing");
  }

  function handleCancel() {
    setKeyValue("");
    setState("idle");
  }

  async function handleSave() {
    if (!keyValue.trim()) return;
    try {
      await saveApiKey({
        variables: { input: { provider, key: keyValue } },
      });
      setKeyValue("");
      setState("idle");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível salvar a chave.",
      );
    }
  }

  async function handleDelete() {
    try {
      await deleteApiKey({ variables: { provider } });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível remover a chave.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-primary-border bg-input-background/40 p-4">
      <div>
        <p className="text-sm font-medium text-primary-text">{label}</p>
        <p className="mt-0.5 text-xs text-secondary-text">{description}</p>
      </div>

      {state === "editing" ? (
        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            placeholder="Cole a chave aqui"
            autoFocus
            className="w-full rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:border-focus-border focus:outline-none"
          />
          {saveError && (
            <p className="text-xs text-error">
              {saveError.message ?? "Não foi possível salvar a chave."}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={!keyValue.trim() || saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-secondary-text">
            {configured ? "••••••••••••••••" : "Não configurada"}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleStartEdit}
              disabled={deleting}
            >
              {configured ? "Editar" : "Configurar"}
            </Button>
            {configured && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Removendo..." : "Remover"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
