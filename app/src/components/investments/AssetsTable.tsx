import { useState } from "react";
import type { Asset, AssetType } from "../../api/investments/types";
import {
  useAssets,
  useDeactivateAsset,
  useReactivateAsset,
} from "../../hooks/useAssetSearch";
import Button from "../Button";
import { useToast } from "../Toast";
import { ModalShell } from "./ReinvestmentModal";
import { assetMarketLabels, assetTypeLabels } from "./labels";
import CircleMinusIcon from "../../assets/icons/circle-minus.svg?react";
import CircleCheckIcon from "../../assets/icons/circle-check.svg?react";

type Props = {
  assetType: AssetType | null;
  onCreateClick: () => void;
};

type Tab = "active" | "inactive";

export default function AssetsTable({ assetType, onCreateClick }: Props) {
  const [tab, setTab] = useState<Tab>("active");
  const { data, loading, error, refetch } = useAssets(tab === "active");

  const allAssets = data?.assets ?? [];
  const assets = assetType
    ? allAssets.filter((asset) => asset.assetType === assetType)
    : allAssets;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-primary-text">
          Ativos cadastrados
        </h2>
        <Button type="button" variant="primary" onClick={onCreateClick}>
          Novo ativo
        </Button>
      </div>

      <div className="inline-flex w-fit gap-1 rounded-lg border border-primary-border bg-card-background p-1">
        <TabButton active={tab === "active"} onClick={() => setTab("active")}>
          Ativos
        </TabButton>
        <TabButton active={tab === "inactive"} onClick={() => setTab("inactive")}>
          Desativados
        </TabButton>
      </div>

      {loading && allAssets.length === 0 ? (
        <div className="h-40 animate-pulse rounded-2xl border border-primary-border bg-card-background" />
      ) : error && allAssets.length === 0 ? (
        <div className="flex items-center justify-between rounded-2xl border border-primary-border bg-card-background px-5 py-4">
          <p className="text-sm text-secondary-text">
            Não foi possível carregar os ativos.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-2xl border border-primary-border bg-card-background px-5 py-10 text-center text-sm text-secondary-text">
          {tab === "inactive"
            ? "Nenhum ativo desativado."
            : assetType
              ? "Nenhum ativo encontrado para este filtro."
              : "Nenhum ativo cadastrado ainda."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-primary-border bg-card-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-border text-left text-xs text-secondary-text">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Ticker</th>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Mercado</th>
                <th className="px-5 py-3 font-medium">Moeda</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  index={index}
                  tab={tab}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function TabButton({
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
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-hover-background text-primary-text"
          : "text-secondary-text hover:text-primary-text"
      }`}
    >
      {children}
    </button>
  );
}

function AssetRow({
  asset,
  index,
  tab,
}: {
  asset: Asset;
  index: number;
  tab: Tab;
}) {
  const { showToast } = useToast();
  const [deactivateAsset, { loading: deactivating }] = useDeactivateAsset();
  const [reactivateAsset, { loading: reactivating }] = useReactivateAsset();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const loading = deactivating || reactivating;

  async function handleDeactivate() {
    setConfirmOpen(false);
    try {
      await deactivateAsset({ variables: { id: asset.id } });
      showToast("Ativo desativado.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível desativar o ativo.",
      );
    }
  }

  async function handleReactivate() {
    try {
      await reactivateAsset({ variables: { id: asset.id } });
      showToast("Ativo reativado.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível reativar o ativo.",
      );
    }
  }

  return (
    <>
      <tr className="border-b border-primary-border last:border-0">
        <td className="px-5 py-3 text-secondary-text">{index + 1}</td>
        <td className="px-5 py-3 font-medium text-primary-text">
          {asset.ticker}
        </td>
        <td className="px-5 py-3 text-primary-text">{asset.name}</td>
        <td className="px-5 py-3">
          <span className="inline-flex items-center rounded-full bg-badge-background px-2 py-0.5 text-[11px] font-medium text-primary">
            {assetTypeLabels[asset.assetType]}
          </span>
        </td>
        <td className="px-5 py-3 text-secondary-text">
          {assetMarketLabels[asset.market]}
        </td>
        <td className="px-5 py-3 text-secondary-text">{asset.currency}</td>
        <td className="px-5 py-3 text-right">
          {tab === "active" ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={loading || asset.hasOpenInvestment}
              className="inline-flex items-center justify-center text-secondary-text transition-colors hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
              title={
                asset.hasOpenInvestment
                  ? "Não é possível desativar: há uma posição aberta neste ativo"
                  : "Desativar ativo"
              }
            >
              <CircleMinusIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReactivate}
              disabled={loading}
              className="inline-flex items-center justify-center text-secondary-text transition-colors hover:text-success disabled:cursor-not-allowed disabled:opacity-40"
              title="Reativar ativo"
            >
              <CircleCheckIcon className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>

      {confirmOpen && (
        <ModalShell
          title="Desativar ativo"
          onClose={() => setConfirmOpen(false)}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-primary-text">
              Tem certeza que deseja desativar{" "}
              <span className="font-semibold">{asset.ticker}</span>? O ativo não
              aparecerá mais nas buscas para novos investimentos, mas suas
              posições existentes não serão afetadas.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? "Desativando..." : "Desativar"}
              </Button>
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}
