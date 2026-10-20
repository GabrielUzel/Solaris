import { gql } from "@apollo/client";
import type { ApiKeyStatus } from "./types";

export const API_KEY_STATUSES = gql`
  query ApiKeyStatuses {
    apiKeyStatuses {
      provider
      configured
    }
  }
`;

export type GetApiKeyStatusesData = {
  apiKeyStatuses: ApiKeyStatus[];
};
