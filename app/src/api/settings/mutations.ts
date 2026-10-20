import { gql } from "@apollo/client";
import type { ApiKeyStatus, SaveApiKeyInput } from "./types";

export const SAVE_API_KEY = gql`
  mutation SaveApiKey($input: SaveApiKeyInput!) {
    saveApiKey(input: $input) {
      provider
      configured
    }
  }
`;

export const DELETE_API_KEY = gql`
  mutation DeleteApiKey($provider: String!) {
    deleteApiKey(provider: $provider) {
      provider
      configured
    }
  }
`;

export type SaveApiKeyData = {
  saveApiKey: ApiKeyStatus;
};

export type SaveApiKeyVars = {
  input: SaveApiKeyInput;
};

export type DeleteApiKeyData = {
  deleteApiKey: ApiKeyStatus;
};

export type DeleteApiKeyVars = {
  provider: string;
};
