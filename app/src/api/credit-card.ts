import { gql } from "@apollo/client";

import type {
  CreateCreditCardInput,
  CreditCard,
  CreditCardInvoices,
  CreateCreditCardPurchaseInput,
  UpdateCreditCardInput,
} from "./types/credit-card";

export type ListCreditCardsData = {
  listCreditCards: CreditCard[];
};

export type GetCreditCardInvoicesData = {
  getCreditCardInvoices: CreditCardInvoices;
};

export type CreateCreditCardData = {
  createCreditCard: CreditCard;
};

export type UpdateCreditCardData = {
  updateCreditCard: CreditCard;
};

export type DeactivateCreditCardData = {
  deactivateCreditCard: CreditCard;
};

export type CreateCreditCardPurchaseData = {
  createCreditCardPurchase: { id: string }[];
};

export type GetCreditCardInvoicesVars = {
  cardId: string;
};

export type CreateCreditCardVars = {
  input: CreateCreditCardInput;
};

export type UpdateCreditCardVars = {
  id: string;
  input: UpdateCreditCardInput;
};

export type DeactivateCreditCardVars = {
  id: string;
};

export type CreateCreditCardPurchaseVars = {
  input: CreateCreditCardPurchaseInput;
};

export const LIST_CREDIT_CARDS = gql`
  query ListCreditCards {
    listCreditCards {
      id
      name
      bank
      closingDay
      dueDay
      active
      hasOverdueInvoice
      currentInvoice {
        creditCardId
        periodStart
        periodEnd
        closingDate
        dueDate
        total
        paidTotal
        openTotal
        status
        entries {
          transactionId
        }
      }
    }
  }
`;

export const GET_CREDIT_CARD_INVOICES = gql`
  query GetCreditCardInvoices($cardId: ID!) {
    getCreditCardInvoices(cardId: $cardId) {
      currentInvoice {
        creditCardId
        periodStart
        periodEnd
        closingDate
        dueDate
        total
        paidTotal
        openTotal
        status
        entries {
          transactionId
          budgetMonthId
          description
          categoryId
          categoryName
          categoryColor
          amount
          expectedAmount
          actualAmount
          status
          occurredOn
          installmentNumber
          installmentsTotal
          installmentGroupId
          notes
        }
      }
      futureInvoices {
        creditCardId
        periodStart
        periodEnd
        closingDate
        dueDate
        total
        paidTotal
        openTotal
        status
        entries {
          transactionId
          budgetMonthId
          description
          categoryId
          categoryName
          categoryColor
          amount
          expectedAmount
          actualAmount
          status
          occurredOn
          installmentNumber
          installmentsTotal
          installmentGroupId
          notes
        }
      }
    }
  }
`;

export const CREATE_CREDIT_CARD = gql`
  mutation CreateCreditCard($input: CreateCreditCardInput!) {
    createCreditCard(input: $input) {
      id
      name
      bank
      closingDay
      dueDay
      active
    }
  }
`;

export const UPDATE_CREDIT_CARD = gql`
  mutation UpdateCreditCard($id: ID!, $input: UpdateCreditCardInput!) {
    updateCreditCard(id: $id, input: $input) {
      id
      name
      bank
      closingDay
      dueDay
      active
    }
  }
`;

export const DEACTIVATE_CREDIT_CARD = gql`
  mutation DeactivateCreditCard($id: ID!) {
    deactivateCreditCard(id: $id) {
      id
      name
      bank
      closingDay
      dueDay
      active
    }
  }
`;

export const CREATE_CREDIT_CARD_PURCHASE = gql`
  mutation CreateCreditCardPurchase($input: CreateCreditCardPurchaseInput!) {
    createCreditCardPurchase(input: $input) {
      id
    }
  }
`;
