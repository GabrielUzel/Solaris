import { useState } from "react";
import Dropdown from "../Dropdown";
import type {
  AssetIndexer,
  AssetLiquidity,
  AssetMarket,
  AssetType,
  CreateAssetInput,
} from "../../api/investments/types";
import { assetTypeLabels } from "./labels";
import { Field, getToday } from "./ReinvestmentModal";
import DateInput from "../DateInput";

export type AssetFormValue = {
  ticker: string;
  name: string;
  assetType: AssetType;
  market: AssetMarket;
  currency: string;
  category: string;
  priceSource: string;
  externalSymbol: string;
  indexer: AssetIndexer | "";
  indexerRatePercent: string;
  issuer: string;
  maturityDate: string;
  liquidity: AssetLiquidity | "";
};

export function emptyAssetForm(ticker = ""): AssetFormValue {
  return {
    ticker,
    name: "",
    assetType: "STOCK",
    market: "B3",
    currency: "BRL",
    category: "",
    priceSource: "brapi_b3",
    externalSymbol: "",
    indexer: "",
    indexerRatePercent: "",
    issuer: "",
    maturityDate: "",
    liquidity: "",
  };
}

export function assetFormToInput(form: AssetFormValue): CreateAssetInput {
  const isFixedIncome = form.assetType === "FIXED_INCOME";

  return {
    ticker: form.ticker.trim().toUpperCase(),
    name: form.name.trim(),
    assetType: form.assetType,
    market: form.market,
    currency: form.currency,
    category: form.category.trim() || null,
    priceSource: form.priceSource,
    externalSymbol: form.externalSymbol.trim() || null,
    indexer: isFixedIncome && form.indexer !== "" ? form.indexer : null,
    indexerRatePercent:
      isFixedIncome && form.indexerRatePercent.trim() !== ""
        ? parseFloat(form.indexerRatePercent.replace(",", "."))
        : null,
    issuer: isFixedIncome ? form.issuer.trim() || null : null,
    maturityDate: isFixedIncome ? form.maturityDate || null : null,
    liquidity: isFixedIncome && form.liquidity !== "" ? form.liquidity : null,
  };
}

export function isAssetFormValid(form: AssetFormValue): boolean {
  if (form.ticker.trim() === "" || form.name.trim() === "") return false;

  if (form.assetType !== "FIXED_INCOME") return true;

  return (
    form.indexer !== "" &&
    form.issuer.trim() !== "" &&
    form.maturityDate !== "" &&
    form.liquidity !== ""
  );
}

type Props = {
  value: AssetFormValue;
  onChange: (value: AssetFormValue) => void;
  onVerifyTicker?: () => void;
  validating?: boolean;
};

export default function CreateAssetFields({
  value,
  onChange,
  onVerifyTicker,
  validating = false,
}: Props) {
  const [touchedMaturity] = useState(getToday());

  function update<K extends keyof AssetFormValue>(
    key: K,
    next: AssetFormValue[K],
  ) {
    const updated = { ...value, [key]: next };

    if (key === "market") {
      updated.currency = next === "US_MARKET" ? "USD" : "BRL";
      updated.priceSource = next === "US_MARKET" ? "finnhub_us" : "brapi_b3";
    }

    if (key === "assetType" && next === "FIXED_INCOME") {
      updated.priceSource = "manual_curve";
    }

    if (key === "assetType" && next !== "FIXED_INCOME") {
      updated.indexer = "";
      updated.indexerRatePercent = "";
      updated.issuer = "";
      updated.maturityDate = "";
      updated.liquidity = "";
      if (value.priceSource === "manual_curve") {
        updated.priceSource = "brapi_b3";
      }
    }

    onChange(updated);
  }

  const isFixedIncome = value.assetType === "FIXED_INCOME";
  const needsValidation = !isFixedIncome;

  const priceSourceOptions =
    value.market === "US_MARKET"
      ? [{ label: "Finnhub (EUA)", value: "finnhub_us" }]
      : isFixedIncome
        ? [
            { label: "Curva manual", value: "manual_curve" },
            { label: "Tesouro Direto", value: "brapi_treasury" },
            { label: "B3", value: "brapi_b3" },
          ]
        : [
            { label: "B3", value: "brapi_b3" },
            { label: "Tesouro Direto", value: "brapi_treasury" },
            { label: "Curva manual", value: "manual_curve" },
          ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ticker">
          <div className="flex gap-2">
            <input
              type="text"
              value={value.ticker}
              onChange={(e) => update("ticker", e.target.value.toUpperCase())}
              className={inputClass}
            />
            {needsValidation && onVerifyTicker && (
              <button
                type="button"
                onClick={onVerifyTicker}
                disabled={value.ticker.trim() === "" || validating}
                className="shrink-0 whitespace-nowrap rounded-lg border border-primary-border bg-card-background px-3 py-2 text-xs font-medium text-primary-text transition-colors hover:bg-hover-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                {validating ? "Verificando..." : "Verificar"}
              </button>
            )}
          </div>
        </Field>

        <Field label="Nome">
          <input
            type="text"
            value={value.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <Dropdown
            label="Selecione o tipo"
            value={value.assetType}
            onChange={(v) => update("assetType", v as AssetType)}
            options={(["STOCK", "REIT_FII", "FIXED_INCOME"] as AssetType[]).map(
              (v) => ({ label: assetTypeLabels[v], value: v }),
            )}
          />
        </Field>

        <Field label="Mercado">
          <Dropdown
            label="Selecione o mercado"
            value={value.market}
            onChange={(v) => update("market", v as AssetMarket)}
            options={[
              { label: "Brasil (B3)", value: "B3" },
              { label: "Estados Unidos", value: "US_MARKET" },
            ]}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Moeda">
          <Dropdown
            label="Selecione a moeda"
            value={value.currency}
            onChange={(v) => update("currency", v)}
            options={[
              { label: "Real (BRL)", value: "BRL" },
              { label: "Dólar (USD)", value: "USD" },
            ]}
          />
        </Field>

        <Field label="Fonte de preços">
          <Dropdown
            label="Selecione a fonte"
            value={value.priceSource}
            onChange={(v) => update("priceSource", v)}
            options={priceSourceOptions}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Categoria (opcional)"
          hint="Grupo livre para organizar seus ativos (ex: Dividendos, Small Caps, Internacional). Não está ligado às categorias do orçamento."
        >
          <input
            type="text"
            value={value.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Símbolo externo (opcional)"
          hint="Código usado para buscar a cotação nas APIs externas (Brapi/Finnhub). Se vazio, o próprio ticker é usado. Útil quando o símbolo da API difere do ticker (ex: HGLG11.SA)."
        >
          <input
            type="text"
            value={value.externalSymbol}
            onChange={(e) => update("externalSymbol", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {isFixedIncome && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Indexador">
              <Dropdown
                label="Selecione o indexador"
                value={value.indexer}
                onChange={(v) => update("indexer", v as AssetIndexer)}
                options={[
                  { label: "CDI", value: "CDI" },
                  { label: "Selic", value: "SELIC" },
                  { label: "IPCA", value: "IPCA" },
                  { label: "Prefixado", value: "PREFIXADO" },
                ]}
              />
            </Field>

            <Field label="Taxa sobre o indexador (%)">
              <input
                type="number"
                min="0"
                step="any"
                value={value.indexerRatePercent}
                onChange={(e) => update("indexerRatePercent", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Emissor">
              <input
                type="text"
                value={value.issuer}
                onChange={(e) => update("issuer", e.target.value)}
                className={inputClass}
              />
            </Field>

              <Field label="Vencimento">
                <DateInput
                  min={touchedMaturity}
                  value={value.maturityDate}
                  onChange={(v) => update("maturityDate", v)}
                />
              </Field>
          </div>

          <Field label="Liquidez">
            <Dropdown
              label="Selecione a liquidez"
              value={value.liquidity}
              onChange={(v) => update("liquidity", v as AssetLiquidity)}
              options={[
                { label: "Diária", value: "daily" },
                { label: "Somente no vencimento", value: "maturity_only" },
              ]}
            />
          </Field>
        </>
      )}
    </div>
  );
}

const inputClass =
  "rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text [appearance:textfield] focus:border-focus-border focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
