import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_PLANNED_TRANSACTION,
  DEACTIVATE_PLANNED_TRANSACTION,
  DELETE_PLANNED_TRANSACTION,
  GET_PLANNED_TRANSACTION_BY_ID,
  LIST_ACTIVE_PLANNED_TRANSACTIONS,
  REACTIVATE_PLANNED_TRANSACTION,
  UPDATE_PLANNED_TRANSACTION,
  type CreatePlannedTransactionData,
  type CreatePlannedTransactionVars,
  type DeactivatePlannedTransactionData,
  type DeactivatePlannedTransactionVars,
  type DeletePlannedTransactionData,
  type DeletePlannedTransactionVars,
  type GetPlannedTransactionByIdData,
  type GetPlannedTransactionByIdVars,
  type ListActivePlannedTransactionsData,
  type ReactivatePlannedTransactionData,
  type ReactivatePlannedTransactionVars,
  type UpdatePlannedTransactionData,
  type UpdatePlannedTransactionVars,
} from "../api/planned-transaction";

export function useListActivePlannedTransactions() {
  return useQuery<ListActivePlannedTransactionsData>(
    LIST_ACTIVE_PLANNED_TRANSACTIONS,
  );
}

export function useGetPlannedTransactionById(id?: string) {
  return useQuery<GetPlannedTransactionByIdData, GetPlannedTransactionByIdVars>(
    GET_PLANNED_TRANSACTION_BY_ID,
    id ? { variables: { id } } : skipToken,
  );
}

export function useCreatePlannedTransaction() {
  return useMutation<
    CreatePlannedTransactionData,
    CreatePlannedTransactionVars
  >(CREATE_PLANNED_TRANSACTION, {
    refetchQueries: [{ query: LIST_ACTIVE_PLANNED_TRANSACTIONS }],
    awaitRefetchQueries: true,
  });
}

export function useUpdatePlannedTransaction() {
  return useMutation<
    UpdatePlannedTransactionData,
    UpdatePlannedTransactionVars
  >(UPDATE_PLANNED_TRANSACTION, {
    awaitRefetchQueries: true,
  });
}

export function useDeactivatePlannedTransaction() {
  return useMutation<
    DeactivatePlannedTransactionData,
    DeactivatePlannedTransactionVars
  >(DEACTIVATE_PLANNED_TRANSACTION, {
    awaitRefetchQueries: true,
  });
}

export function useReactivatePlannedTransaction() {
  return useMutation<
    ReactivatePlannedTransactionData,
    ReactivatePlannedTransactionVars
  >(REACTIVATE_PLANNED_TRANSACTION, {
    awaitRefetchQueries: true,
  });
}

export function useDeletePlannedTransaction() {
  return useMutation<
    DeletePlannedTransactionData,
    DeletePlannedTransactionVars
  >(DELETE_PLANNED_TRANSACTION, {
    awaitRefetchQueries: true,
  });
}
