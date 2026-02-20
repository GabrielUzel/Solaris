import { GraphQLClient } from "graphql-request";
import {
  GetTotalBalanceDocument,
  CreateAccountDocument,
  UpdateAccountDocument,
  DeleteAccountDocument,
  GetAllAccountsDocument,
  GetAccountBalanceDocument,
} from "../../gql/graphql";
import type {
  GetTotalBalanceQuery,
  GetAllAccountsQuery,
  GetAccountBalanceQuery,
  CreateAccountMutationVariables,
  UpdateAccountMutationVariables,
} from "../../gql/graphql";

export class AccountsGateway {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(
      import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/api/graphql",
    );
  }

  async getAllAccounts(): Promise<GetAllAccountsQuery["accounts"]> {
    const data = await this.client.request(GetAllAccountsDocument);
    return data.accounts;
  }

  async getAccountBalance(
    id: string,
  ): Promise<GetAccountBalanceQuery["accountBalance"]> {
    const data = await this.client.request(GetAccountBalanceDocument, { id });
    return data.accountBalance;
  }

  async getTotalBalance(): Promise<GetTotalBalanceQuery["totalBalance"]> {
    const data = await this.client.request(GetTotalBalanceDocument);
    return data.totalBalance;
  }

  async createAccount(input: CreateAccountMutationVariables["input"]) {
    const data = await this.client.request(CreateAccountDocument, { input });
    return data.createAccount;
  }

  async updateAccount(
    id: string,
    input: UpdateAccountMutationVariables["input"],
  ) {
    const data = await this.client.request(UpdateAccountDocument, {
      id,
      input,
    });

    return data.updateAccount;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const data = await this.client.request(DeleteAccountDocument, { id });
    return data.deleteAccount ?? false;
  }
}

export const accountsGateway = new AccountsGateway();
