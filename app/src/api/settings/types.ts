export type ApiProvider = "brapi" | "finnhub";

export type ApiKeyStatus = {
  provider: ApiProvider;
  configured: boolean;
};

export type SaveApiKeyInput = {
  provider: ApiProvider;
  key: string;
};
