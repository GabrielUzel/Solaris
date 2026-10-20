import { useMemo } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import {
  LIST_ASSETS,
  VALIDATE_ASSET_TICKER,
  type ListAssetsData,
  type ListAssetsVars,
  type ValidateAssetTickerData,
  type ValidateAssetTickerVars,
} from "../api/investments/queries";
import {
  CREATE_ASSET,
  DEACTIVATE_ASSET,
  REACTIVATE_ASSET,
  type CreateAssetData,
  type CreateAssetVars,
  type DeactivateAssetData,
  type DeactivateAssetVars,
  type ReactivateAssetData,
  type ReactivateAssetVars,
} from "../api/investments/mutations";
import type { Asset } from "../api/investments/types";

export function useAssets(active = true) {
  return useQuery<ListAssetsData, ListAssetsVars>(LIST_ASSETS, {
    variables: { active },
  });
}

// A query `assets` não expõe busca textual — filtra por tipo/mercado apenas.
// Como o volume é pequeno (ativos da carteira), a busca por ticker/nome é
// feita no cliente sobre a lista cacheada.
export function useAssetSearch(search: string, active = true) {
  const query = useQuery<ListAssetsData, ListAssetsVars>(LIST_ASSETS, {
    variables: { active },
  });

  const assets = useMemo(() => {
    const all = query.data?.assets ?? [];
    const term = search.trim().toLowerCase();

    if (!term) return all;

    return all.filter(
      (asset) =>
        asset.ticker.toLowerCase().includes(term) ||
        asset.name.toLowerCase().includes(term),
    );
  }, [query.data, search]);

  return { ...query, assets };
}

// Otimista apenas para os campos digitados pelo usuário (ticker, nome, tipo,
// mercado, moeda...) — nenhum campo calculado pelo servidor existe em Asset.
// O update usa (ticker, market) para trocar o registro otimista pelo real na
// segunda chamada, evitando duplicar o item na lista cacheada.
export function useCreateAsset() {
  return useMutation<CreateAssetData, CreateAssetVars>(CREATE_ASSET, {
    optimisticResponse: (vars) => ({
      createAsset: {
        __typename: "Asset",
        id: `temp-asset-${Date.now()}`,
        ticker: vars.input.ticker,
        name: vars.input.name,
        assetType: vars.input.assetType,
        market: vars.input.market,
        currency: vars.input.currency,
        category: vars.input.category ?? null,
        active: true,
        hasOpenInvestment: false,
        indexer: (vars.input.indexer as Asset["indexer"]) ?? null,
        indexerRatePercent: vars.input.indexerRatePercent ?? null,
        issuer: vars.input.issuer ?? null,
        maturityDate: vars.input.maturityDate ?? null,
      },
    }),
    update(cache, { data }) {
      const created = data?.createAsset;
      if (!created) return;

      const existing = cache.readQuery<ListAssetsData, ListAssetsVars>({
        query: LIST_ASSETS,
        variables: { active: true },
      });
      if (!existing) return;

      const matchesCreated = (asset: Asset) =>
        asset.ticker === created.ticker && asset.market === created.market;

      const assets = existing.assets.some(matchesCreated)
        ? existing.assets.map((asset) =>
            matchesCreated(asset) ? created : asset,
          )
        : [...existing.assets, created];

      cache.writeQuery<ListAssetsData, ListAssetsVars>({
        query: LIST_ASSETS,
        variables: { active: true },
        data: { assets },
      });
    },
  });
}

export function useValidateAssetTicker() {
  return useLazyQuery<ValidateAssetTickerData, ValidateAssetTickerVars>(
    VALIDATE_ASSET_TICKER,
  );
}

export function useDeactivateAsset() {
  return useMutation<DeactivateAssetData, DeactivateAssetVars>(DEACTIVATE_ASSET, {
    update(cache, { data }) {
      const deactivated = data?.deactivateAsset;
      if (!deactivated) return;

      cache.updateQuery<ListAssetsData, ListAssetsVars>(
        { query: LIST_ASSETS, variables: { active: true } },
        (existing) => ({
          assets: (existing?.assets ?? []).filter((a) => a.id !== deactivated.id),
        }),
      );
    },
  });
}

export function useReactivateAsset() {
  return useMutation<ReactivateAssetData, ReactivateAssetVars>(REACTIVATE_ASSET, {
    update(cache, { data }) {
      const reactivated = data?.reactivateAsset;
      if (!reactivated) return;

      cache.updateQuery<ListAssetsData, ListAssetsVars>(
        { query: LIST_ASSETS, variables: { active: false } },
        (existing) => ({
          assets: (existing?.assets ?? []).filter((a) => a.id !== reactivated.id),
        }),
      );

      cache.updateQuery<ListAssetsData, ListAssetsVars>(
        { query: LIST_ASSETS, variables: { active: true } },
        (existing) => {
          const assets = existing?.assets ?? [];
          const matches = (a: Asset) =>
            a.ticker === reactivated.ticker && a.market === reactivated.market;

          return {
            assets: assets.some(matches)
              ? assets.map((a) => (matches(a) ? reactivated : a))
              : [...assets, reactivated],
          };
        },
      );
    },
  });
}
