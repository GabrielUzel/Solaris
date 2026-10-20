import { useMutation, useQuery } from "@apollo/client/react";
import {
  API_KEY_STATUSES,
  type GetApiKeyStatusesData,
} from "../api/settings/queries";
import {
  DELETE_API_KEY,
  SAVE_API_KEY,
  type DeleteApiKeyData,
  type DeleteApiKeyVars,
  type SaveApiKeyData,
  type SaveApiKeyVars,
} from "../api/settings/mutations";

export function useApiKeyStatuses() {
  return useQuery<GetApiKeyStatusesData>(API_KEY_STATUSES);
}

export function useSaveApiKey() {
  return useMutation<SaveApiKeyData, SaveApiKeyVars>(SAVE_API_KEY, {
    refetchQueries: [API_KEY_STATUSES],
  });
}

export function useDeleteApiKey() {
  return useMutation<DeleteApiKeyData, DeleteApiKeyVars>(DELETE_API_KEY, {
    refetchQueries: [API_KEY_STATUSES],
  });
}
