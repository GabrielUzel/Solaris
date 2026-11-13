import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_CREDIT_CARD,
  CREATE_CREDIT_CARD_PURCHASE,
  DEACTIVATE_CREDIT_CARD,
  GET_CREDIT_CARD_INVOICES,
  LIST_CREDIT_CARDS,
  UPDATE_CREDIT_CARD,
  type CreateCreditCardData,
  type CreateCreditCardPurchaseData,
  type CreateCreditCardPurchaseVars,
  type CreateCreditCardVars,
  type DeactivateCreditCardData,
  type DeactivateCreditCardVars,
  type GetCreditCardInvoicesData,
  type GetCreditCardInvoicesVars,
  type ListCreditCardsData,
  type UpdateCreditCardData,
  type UpdateCreditCardVars,
} from "../api/credit-card";

export function useListCreditCards() {
  return useQuery<ListCreditCardsData>(LIST_CREDIT_CARDS);
}

export function useGetCreditCardInvoices(cardId?: string) {
  return useQuery<GetCreditCardInvoicesData, GetCreditCardInvoicesVars>(
    GET_CREDIT_CARD_INVOICES,
    cardId ? { variables: { cardId } } : skipToken,
  );
}

export function useCreateCreditCard() {
  return useMutation<CreateCreditCardData, CreateCreditCardVars>(
    CREATE_CREDIT_CARD,
    {
      refetchQueries: [{ query: LIST_CREDIT_CARDS }],
      awaitRefetchQueries: true,
    },
  );
}

export function useUpdateCreditCard() {
  return useMutation<UpdateCreditCardData, UpdateCreditCardVars>(
    UPDATE_CREDIT_CARD,
    {
      refetchQueries: [{ query: LIST_CREDIT_CARDS }],
      awaitRefetchQueries: true,
    },
  );
}

export function useDeactivateCreditCard() {
  return useMutation<DeactivateCreditCardData, DeactivateCreditCardVars>(
    DEACTIVATE_CREDIT_CARD,
    {
      refetchQueries: [{ query: LIST_CREDIT_CARDS }],
      awaitRefetchQueries: true,
    },
  );
}

export function useCreateCreditCardPurchase() {
  return useMutation<
    CreateCreditCardPurchaseData,
    CreateCreditCardPurchaseVars
  >(CREATE_CREDIT_CARD_PURCHASE);
}
