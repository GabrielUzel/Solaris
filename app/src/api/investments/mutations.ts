import { gql } from "@apollo/client";

import { ASSET_FIELDS, TRANSACTION_FIELDS } from "./queries";
import type {
  AddReinvestmentInput,
  Asset,
  CreateAssetInput,
  CreateInvestmentInput,
  DividendIncome,
  Investment,
  RegisterIncomeInput,
  RegisterSaleInput,
} from "./types";

export const CREATE_ASSET = gql`
  ${ASSET_FIELDS}
  mutation CreateAsset($input: CreateAssetInput!) {
    createAsset(input: $input) {
      ...AssetFields
    }
  }
`;

export const DEACTIVATE_ASSET = gql`
  ${ASSET_FIELDS}
  mutation DeactivateAsset($id: ID!) {
    deactivateAsset(id: $id) {
      ...AssetFields
    }
  }
`;

export const REACTIVATE_ASSET = gql`
  ${ASSET_FIELDS}
  mutation ReactivateAsset($id: ID!) {
    reactivateAsset(id: $id) {
      ...AssetFields
    }
  }
`;

export const CREATE_INVESTMENT = gql`
  ${ASSET_FIELDS}
  mutation CreateInvestment($input: CreateInvestmentInput!) {
    createInvestment(input: $input) {
      id
      status
      openedAt
      asset {
        ...AssetFields
      }
    }
  }
`;

export const ADD_REINVESTMENT = gql`
  ${TRANSACTION_FIELDS}
  mutation AddReinvestment($input: AddReinvestmentInput!) {
    addReinvestment(input: $input) {
      id
      status
      transactions {
        ...TransactionFields
      }
    }
  }
`;

export const REGISTER_SALE = gql`
  ${TRANSACTION_FIELDS}
  mutation RegisterSale($input: RegisterSaleInput!) {
    registerSale(input: $input) {
      id
      status
      closedAt
      transactions {
        ...TransactionFields
      }
    }
  }
`;

export const REGISTER_INCOME = gql`
  mutation RegisterIncome($input: RegisterIncomeInput!) {
    registerIncome(input: $input) {
      id
      incomeType
      grossAmountCents
      netAmountCents
      paymentDate
    }
  }
`;

export type CreateAssetData = {
  createAsset: Asset;
};

export type CreateAssetVars = {
  input: CreateAssetInput;
};

export type DeactivateAssetData = {
  deactivateAsset: Asset;
};

export type DeactivateAssetVars = {
  id: string;
};

export type ReactivateAssetData = {
  reactivateAsset: Asset;
};

export type ReactivateAssetVars = {
  id: string;
};

export type CreateInvestmentData = {
  createInvestment: Pick<Investment, "id" | "status" | "openedAt" | "asset">;
};

export type CreateInvestmentVars = {
  input: CreateInvestmentInput;
};

export type AddReinvestmentData = {
  addReinvestment: Pick<Investment, "id" | "status" | "transactions">;
};

export type AddReinvestmentVars = {
  input: AddReinvestmentInput;
};

export type RegisterSaleData = {
  registerSale: Pick<Investment, "id" | "status" | "closedAt" | "transactions">;
};

export type RegisterSaleVars = {
  input: RegisterSaleInput;
};

export type RegisterIncomeData = {
  registerIncome: DividendIncome;
};

export type RegisterIncomeVars = {
  input: RegisterIncomeInput;
};
