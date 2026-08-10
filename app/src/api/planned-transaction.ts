import { gql } from "@apollo/client";

export type {
  PlannedTransaction,
  CreatePlannedTransactionInput,
  UpdatePlannedTransactionInput,
  CreatePlannedTransactionData,
  UpdatePlannedTransactionData,
  DeactivatePlannedTransactionData,
  ReactivatePlannedTransactionData,
  DeletePlannedTransactionData,
  GetPlannedTransactionByIdData,
  ListActivePlannedTransactionsData,
  CreatePlannedTransactionVars,
  UpdatePlannedTransactionVars,
  DeactivatePlannedTransactionVars,
  ReactivatePlannedTransactionVars,
  DeletePlannedTransactionVars,
  GetPlannedTransactionByIdVars,
} from "./types/planned-transaction";

export const GET_PLANNED_TRANSACTION_BY_ID = gql`
  query GetPlannedTransactionById($id: ID!) {
    getPlannedTransactionById(id: $id) {
      id
      description
      amount
      type
      categoryId
      categoryName
      categoryColor
      categoryType
      paymentMethod
      dayOfMonth
      startsOn
      active
      notes
    }
  }
`;

export const LIST_ACTIVE_PLANNED_TRANSACTIONS = gql`
  query ListActivePlannedTransactions {
    listActivePlannedTransactions {
      id
      description
      amount
      type
      categoryId
      categoryName
      categoryColor
      categoryType
      paymentMethod
      dayOfMonth
      startsOn
      active
      notes
    }
  }
`;

export const CREATE_PLANNED_TRANSACTION = gql`
  mutation CreatePlannedTransaction($input: CreatePlannedTransactionInput!) {
    createPlannedTransaction(input: $input) {
      id
      description
      amount
      type
      categoryId
      categoryName
      categoryColor
      categoryType
      paymentMethod
      dayOfMonth
      startsOn
      active
      notes
    }
  }
`;

export const UPDATE_PLANNED_TRANSACTION = gql`
  mutation UpdatePlannedTransaction(
    $id: ID!
    $input: UpdatePlannedTransactionInput!
  ) {
    updatePlannedTransaction(id: $id, input: $input) {
      id
      description
      amount
      type
      categoryId
      categoryName
      categoryColor
      categoryType
      paymentMethod
      dayOfMonth
      startsOn
      active
      notes
    }
  }
`;

export const DEACTIVATE_PLANNED_TRANSACTION = gql`
  mutation DeactivatePlannedTransaction($id: ID!) {
    deactivatePlannedTransaction(id: $id) {
      id
      description
      amount
      type
      categoryId
      categoryName
      categoryColor
      categoryType
      paymentMethod
      dayOfMonth
      startsOn
      active
      notes
    }
  }
`;

export const REACTIVATE_PLANNED_TRANSACTION = gql`
  mutation ReactivatePlannedTransaction($id: ID!) {
    reactivatePlannedTransaction(id: $id) {
      id
      description
      amount
      type
      categoryId
      categoryName
      categoryColor
      categoryType
      paymentMethod
      dayOfMonth
      startsOn
      active
      notes
    }
  }
`;

export const DELETE_PLANNED_TRANSACTION = gql`
  mutation DeletePlannedTransaction($id: ID!) {
    deletePlannedTransaction(id: $id)
  }
`;
