import { GraphQLClient } from "graphql-request";
import {
  GetMonthSummaryDocument,
  GetTransactionsByDateRangeDocument,
  CreateTransactionDocument,
  UpdateTransactionDocument,
  DeleteTransactionDocument,
  GetAllTransactionsDocument,
  GetTransactionsByAccountDocument,
  GetTransactionsByCategoryDocument,
  GetTransactionsByTypeDocument,
  GetTransactionsByRecurrenceDocument,
  GetTransactionsForMonthDocument,
} from "../../gql/graphql";
import type {
  GetMonthSummaryQuery,
  GetTransactionsByDateRangeQuery,
  GetAllTransactionsQuery,
  GetTransactionsByAccountQuery,
  GetTransactionsByCategoryQuery,
  GetTransactionsByTypeQuery,
  GetTransactionsByRecurrenceQuery,
  GetTransactionsForMonthQuery,
  CreateTransactionMutationVariables,
  UpdateTransactionMutationVariables,
  TransactionType,
  RecurrenceFrequency,
} from "../../gql/graphql";

export class TransactionsGateway {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(
      import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/api/graphql",
    );
  }

  async getMonthSummary(
    accountId: string,
    year: number,
    month: number,
  ): Promise<GetMonthSummaryQuery["monthSummary"]> {
    const data = await this.client.request(GetMonthSummaryDocument, {
      accountId,
      year,
      month,
    });

    return data.monthSummary;
  }

  async getTransactionsByDateRange(
    accountId: string,
    startDate: string,
    endDate: string,
  ): Promise<GetTransactionsByDateRangeQuery["transactionsByDateRange"]> {
    const data = await this.client.request(GetTransactionsByDateRangeDocument, {
      accountId,
      startDate,
      endDate,
    });

    return data.transactionsByDateRange;
  }

  async getAllTransactions(): Promise<GetAllTransactionsQuery["transactions"]> {
    const data = await this.client.request(GetAllTransactionsDocument);
    return data.transactions;
  }

  async getTransactionsByAccount(
    accountId: string,
  ): Promise<GetTransactionsByAccountQuery["transactionsByAccount"]> {
    const data = await this.client.request(GetTransactionsByAccountDocument, {
      accountId,
    });

    return data.transactionsByAccount;
  }

  async getTransactionsByCategory(
    categoryId: string,
  ): Promise<GetTransactionsByCategoryQuery["transactionsByCategory"]> {
    const data = await this.client.request(GetTransactionsByCategoryDocument, {
      categoryId,
    });

    return data.transactionsByCategory;
  }

  async getTransactionsByType(
    type: TransactionType,
  ): Promise<GetTransactionsByTypeQuery["transactionsByType"]> {
    const data = await this.client.request(GetTransactionsByTypeDocument, {
      type,
    });

    return data.transactionsByType;
  }

  async getTransactionsByRecurrence(
    frequency: RecurrenceFrequency,
  ): Promise<GetTransactionsByRecurrenceQuery["transactionsByRecurrence"]> {
    const data = await this.client.request(
      GetTransactionsByRecurrenceDocument,
      { frequency },
    );

    return data.transactionsByRecurrence;
  }

  async getTransactionsForMonth(
    accountId: string,
    year: number,
    month: number,
  ): Promise<GetTransactionsForMonthQuery["transactionsForMonth"]> {
    const data = await this.client.request(GetTransactionsForMonthDocument, {
      accountId,
      year,
      month,
    });

    return data.transactionsForMonth;
  }

  async createTransaction(input: CreateTransactionMutationVariables["input"]) {
    const data = await this.client.request(CreateTransactionDocument, {
      input,
    });

    return data.createTransaction;
  }

  async updateTransaction(
    id: string,
    input: UpdateTransactionMutationVariables["input"],
  ) {
    const data = await this.client.request(UpdateTransactionDocument, {
      id,
      input,
    });

    return data.updateTransaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const data = await this.client.request(DeleteTransactionDocument, { id });
    return data.deleteTransaction ?? false;
  }
}

export const transactionsGateway = new TransactionsGateway();
