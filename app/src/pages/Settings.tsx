import { useApiKeyStatuses } from "../hooks/useSettings";
import ApiKeyField from "../components/settings/ApiKeyField";

export default function Settings() {
  const { data, loading } = useApiKeyStatuses();

  const brapi = data?.apiKeyStatuses.find((s) => s.provider === "brapi");
  const finnhub = data?.apiKeyStatuses.find((s) => s.provider === "finnhub");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-semibold text-primary-text">
        Configurações
      </h1>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-primary-text">
          Chaves de API
        </h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="h-24 animate-pulse rounded-xl bg-input-background" />
            <div className="h-24 animate-pulse rounded-xl bg-input-background" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ApiKeyField
              label="Brapi"
              description="Necessária para ativos do mercado brasileiro"
              provider="brapi"
              configured={brapi?.configured ?? false}
            />
            <ApiKeyField
              label="Finnhub"
              description="Necessária para ativos do mercado americano"
              provider="finnhub"
              configured={finnhub?.configured ?? false}
            />
          </div>
        )}
      </section>
    </div>
  );
}
