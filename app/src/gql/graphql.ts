/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Account = {
  __typename?: 'Account';
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: AccountType;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type AccountBalance = {
  __typename?: 'AccountBalance';
  balance: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: AccountType;
};

export enum AccountType {
  /** Checking account */
  Checking = 'CHECKING',
  /** Credit card account */
  CreditCard = 'CREDIT_CARD',
  /** Investment account */
  Investment = 'INVESTMENT',
  /** Savings account */
  Savings = 'SAVINGS'
}

export type AccountWithDetails = {
  __typename?: 'AccountWithDetails';
  balance: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  totalExpense: Scalars['Int']['output'];
  totalIncome: Scalars['Int']['output'];
  type: AccountType;
};

export type Category = {
  __typename?: 'Category';
  color?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: TransactionType;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type CategorySummary = {
  __typename?: 'CategorySummary';
  category: Scalars['String']['output'];
  color?: Maybe<Scalars['String']['output']>;
  count: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CategoryWithTransactions = {
  __typename?: 'CategoryWithTransactions';
  category: Category;
  count: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  transactions: Array<TransactionDetail>;
};

export type CreateAccountInput = {
  name: Scalars['String']['input'];
  type: AccountType;
};

export type CreateCategoryInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: TransactionType;
};

export type CreateTransactionInput = {
  accountId: Scalars['String']['input'];
  amount: Scalars['Int']['input'];
  categoryId: Scalars['String']['input'];
  date: Scalars['String']['input'];
  description: Scalars['String']['input'];
  recurrence?: InputMaybe<RecurrenceInput>;
  type: TransactionType;
};

export type DateRange = {
  __typename?: 'DateRange';
  end: Scalars['String']['output'];
  start: Scalars['String']['output'];
};

export type DateRangeResult = {
  __typename?: 'DateRangeResult';
  balance: Scalars['Int']['output'];
  count: Scalars['Int']['output'];
  period: DateRange;
  totalExpense: Scalars['Int']['output'];
  totalIncome: Scalars['Int']['output'];
  transactions: Array<TransactionDetail>;
};

export type MonthSummary = {
  __typename?: 'MonthSummary';
  balance: Scalars['Int']['output'];
  byCategory: Array<CategorySummary>;
  period: Period;
  totalExpense: Scalars['Int']['output'];
  totalIncome: Scalars['Int']['output'];
  transactionsCount: Scalars['Int']['output'];
};

export type MonthTransaction = {
  __typename?: 'MonthTransaction';
  amount: Scalars['Int']['output'];
  categoryColor?: Maybe<Scalars['String']['output']>;
  categoryName: Scalars['String']['output'];
  date: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type: TransactionType;
};

export type Period = {
  __typename?: 'Period';
  month: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type Recurrence = {
  __typename?: 'Recurrence';
  dayOfMonth?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  frequency: RecurrenceFrequency;
  interval?: Maybe<Scalars['Int']['output']>;
};

export enum RecurrenceFrequency {
  /** Daily recurrence */
  Daily = 'DAILY',
  /** Monthly recurrence */
  Monthly = 'MONTHLY',
  /** Weekly recurrence */
  Weekly = 'WEEKLY',
  /** Yearly recurrence */
  Yearly = 'YEARLY'
}

export type RecurrenceInput = {
  dayOfMonth?: InputMaybe<Scalars['Int']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  frequency: RecurrenceFrequency;
  interval?: InputMaybe<Scalars['Int']['input']>;
};

export type RecurrenceResult = {
  __typename?: 'RecurrenceResult';
  count: Scalars['Int']['output'];
  frequency: RecurrenceFrequency;
  transactions: Array<TransactionWithRecurrence>;
};

export type RootMutationType = {
  __typename?: 'RootMutationType';
  createAccount?: Maybe<Account>;
  createCategory?: Maybe<Category>;
  createTransaction?: Maybe<Transaction>;
  deleteAccount?: Maybe<Scalars['Boolean']['output']>;
  deleteCategory?: Maybe<Scalars['Boolean']['output']>;
  deleteTransaction?: Maybe<Scalars['Boolean']['output']>;
  updateAccount?: Maybe<Account>;
  updateCategory?: Maybe<Category>;
  updateTransaction?: Maybe<Transaction>;
};


export type RootMutationTypeCreateAccountArgs = {
  input: CreateAccountInput;
};


export type RootMutationTypeCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type RootMutationTypeCreateTransactionArgs = {
  input: CreateTransactionInput;
};


export type RootMutationTypeDeleteAccountArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateAccountArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAccountInput;
};


export type RootMutationTypeUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
};


export type RootMutationTypeUpdateTransactionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTransactionInput;
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  accountBalance?: Maybe<AccountBalance>;
  accounts: Array<Account>;
  categories: Array<Category>;
  categoryByName?: Maybe<Category>;
  /** Health check endpoint */
  health?: Maybe<Scalars['String']['output']>;
  monthSummary: MonthSummary;
  totalBalance: TotalBalanceResult;
  transactions: Array<Transaction>;
  transactionsByAccount: Array<TransactionDetail>;
  transactionsByCategory?: Maybe<CategoryWithTransactions>;
  transactionsByDateRange: DateRangeResult;
  transactionsByDescription: Array<TransactionDetail>;
  transactionsByRecurrence: RecurrenceResult;
  transactionsByType: TypeResult;
  transactionsForMonth: Array<MonthTransaction>;
};


export type RootQueryTypeAccountBalanceArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeCategoryByNameArgs = {
  name: Scalars['String']['input'];
};


export type RootQueryTypeMonthSummaryArgs = {
  accountId: Scalars['ID']['input'];
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type RootQueryTypeTransactionsByAccountArgs = {
  accountId: Scalars['ID']['input'];
};


export type RootQueryTypeTransactionsByCategoryArgs = {
  categoryId: Scalars['ID']['input'];
};


export type RootQueryTypeTransactionsByDateRangeArgs = {
  accountId: Scalars['ID']['input'];
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type RootQueryTypeTransactionsByDescriptionArgs = {
  description: Scalars['String']['input'];
};


export type RootQueryTypeTransactionsByRecurrenceArgs = {
  frequency: RecurrenceFrequency;
};


export type RootQueryTypeTransactionsByTypeArgs = {
  type: TransactionType;
};


export type RootQueryTypeTransactionsForMonthArgs = {
  accountId: Scalars['ID']['input'];
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};

export type TotalBalanceResult = {
  __typename?: 'TotalBalanceResult';
  accounts: Array<AccountWithDetails>;
  accountsCount: Scalars['Int']['output'];
  totalBalance: Scalars['Int']['output'];
};

export type Transaction = {
  __typename?: 'Transaction';
  accountId: Scalars['String']['output'];
  amount: Scalars['Int']['output'];
  categoryId: Scalars['String']['output'];
  date: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['String']['output']>;
  recurrence?: Maybe<Recurrence>;
  type: TransactionType;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type TransactionDetail = {
  __typename?: 'TransactionDetail';
  accountName: Scalars['String']['output'];
  amount: Scalars['Int']['output'];
  categoryColor?: Maybe<Scalars['String']['output']>;
  categoryName: Scalars['String']['output'];
  date: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isRecurring?: Maybe<Scalars['Boolean']['output']>;
  recurrenceFrequency: RecurrenceFrequency;
  type: TransactionType;
};

export enum TransactionType {
  /** Expense transaction */
  Expense = 'EXPENSE',
  /** Income transaction */
  Income = 'INCOME'
}

export type TransactionWithRecurrence = {
  __typename?: 'TransactionWithRecurrence';
  accountName: Scalars['String']['output'];
  amount: Scalars['Int']['output'];
  categoryName: Scalars['String']['output'];
  date: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  recurrence: Recurrence;
  type: TransactionType;
};

export type TypeResult = {
  __typename?: 'TypeResult';
  count: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  transactions: Array<TransactionDetail>;
};

export type UpdateAccountInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<AccountType>;
};

export type UpdateCategoryInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TransactionType>;
};

export type UpdateTransactionInput = {
  accountId?: InputMaybe<Scalars['String']['input']>;
  amount?: InputMaybe<Scalars['Int']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  recurrence?: InputMaybe<RecurrenceInput>;
  type?: InputMaybe<TransactionType>;
};

export type GetAllAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllAccountsQuery = { __typename?: 'RootQueryType', accounts: Array<{ __typename?: 'Account', id: string, name: string, type: AccountType, insertedAt?: string | null, updatedAt?: string | null }> };

export type GetAccountBalanceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetAccountBalanceQuery = { __typename?: 'RootQueryType', accountBalance?: { __typename?: 'AccountBalance', id: string, name: string, type: AccountType, balance: number, insertedAt?: string | null } | null };

export type GetTotalBalanceQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTotalBalanceQuery = { __typename?: 'RootQueryType', totalBalance: { __typename?: 'TotalBalanceResult', totalBalance: number, accountsCount: number, accounts: Array<{ __typename?: 'AccountWithDetails', id: string, name: string, type: AccountType, balance: number, totalIncome: number, totalExpense: number }> } };

export type CreateAccountMutationVariables = Exact<{
  input: CreateAccountInput;
}>;


export type CreateAccountMutation = { __typename?: 'RootMutationType', createAccount?: { __typename?: 'Account', id: string, name: string, type: AccountType, insertedAt?: string | null } | null };

export type UpdateAccountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateAccountInput;
}>;


export type UpdateAccountMutation = { __typename?: 'RootMutationType', updateAccount?: { __typename?: 'Account', id: string, name: string, type: AccountType } | null };

export type DeleteAccountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteAccountMutation = { __typename?: 'RootMutationType', deleteAccount?: boolean | null };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'RootQueryType', categories: Array<{ __typename?: 'Category', id: string, name: string, type: TransactionType, color?: string | null, insertedAt?: string | null, updatedAt?: string | null }> };

export type GetCategoryByNameQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type GetCategoryByNameQuery = { __typename?: 'RootQueryType', categoryByName?: { __typename?: 'Category', id: string, name: string, type: TransactionType, color?: string | null, insertedAt?: string | null, updatedAt?: string | null } | null };

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryInput;
}>;


export type CreateCategoryMutation = { __typename?: 'RootMutationType', createCategory?: { __typename?: 'Category', id: string, name: string, type: TransactionType, color?: string | null, insertedAt?: string | null } | null };

export type UpdateCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
}>;


export type UpdateCategoryMutation = { __typename?: 'RootMutationType', updateCategory?: { __typename?: 'Category', id: string, name: string, type: TransactionType, color?: string | null, updatedAt?: string | null } | null };

export type DeleteCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCategoryMutation = { __typename?: 'RootMutationType', deleteCategory?: boolean | null };

export type GetMonthSummaryQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
  year: Scalars['Int']['input'];
  month: Scalars['Int']['input'];
}>;


export type GetMonthSummaryQuery = { __typename?: 'RootQueryType', monthSummary: { __typename?: 'MonthSummary', totalIncome: number, totalExpense: number, balance: number, transactionsCount: number, period: { __typename?: 'Period', year: number, month: number }, byCategory: Array<{ __typename?: 'CategorySummary', category: string, total: number, count: number, color?: string | null }> } };

export type GetTransactionsByDateRangeQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type GetTransactionsByDateRangeQuery = { __typename?: 'RootQueryType', transactionsByDateRange: { __typename?: 'DateRangeResult', totalIncome: number, totalExpense: number, balance: number, count: number, transactions: Array<{ __typename?: 'TransactionDetail', id: string, amount: number, type: TransactionType, date: string, description: string, categoryName: string, categoryColor?: string | null, accountName: string }> } };

export type GetAllTransactionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllTransactionsQuery = { __typename?: 'RootQueryType', transactions: Array<{ __typename?: 'Transaction', id: string, amount: number, type: TransactionType, date: string, description: string, categoryId: string, accountId: string }> };

export type GetTransactionsByAccountQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
}>;


export type GetTransactionsByAccountQuery = { __typename?: 'RootQueryType', transactionsByAccount: Array<{ __typename?: 'TransactionDetail', id: string, amount: number, type: TransactionType, date: string, description: string, categoryName: string, accountName: string }> };

export type GetTransactionsByCategoryQueryVariables = Exact<{
  categoryId: Scalars['ID']['input'];
}>;


export type GetTransactionsByCategoryQuery = { __typename?: 'RootQueryType', transactionsByCategory?: { __typename?: 'CategoryWithTransactions', total: number, count: number, category: { __typename?: 'Category', id: string, name: string, type: TransactionType, color?: string | null }, transactions: Array<{ __typename?: 'TransactionDetail', id: string, amount: number, type: TransactionType, date: string, description: string, categoryName: string, accountName: string }> } | null };

export type GetTransactionsByTypeQueryVariables = Exact<{
  type: TransactionType;
}>;


export type GetTransactionsByTypeQuery = { __typename?: 'RootQueryType', transactionsByType: { __typename?: 'TypeResult', total: number, count: number, transactions: Array<{ __typename?: 'TransactionDetail', id: string, amount: number, type: TransactionType, date: string, description: string, categoryName: string, accountName: string }> } };

export type GetTransactionsByRecurrenceQueryVariables = Exact<{
  frequency: RecurrenceFrequency;
}>;


export type GetTransactionsByRecurrenceQuery = { __typename?: 'RootQueryType', transactionsByRecurrence: { __typename?: 'RecurrenceResult', frequency: RecurrenceFrequency, count: number, transactions: Array<{ __typename?: 'TransactionWithRecurrence', id: string, amount: number, type: TransactionType, date: string, description: string, categoryName: string, accountName: string, recurrence: { __typename?: 'Recurrence', frequency: RecurrenceFrequency, interval?: number | null, dayOfMonth?: number | null, endDate?: string | null } }> } };

export type GetTransactionsForMonthQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
  year: Scalars['Int']['input'];
  month: Scalars['Int']['input'];
}>;


export type GetTransactionsForMonthQuery = { __typename?: 'RootQueryType', transactionsForMonth: Array<{ __typename?: 'MonthTransaction', id: string, amount: number, type: TransactionType, date: string, description: string, categoryName: string, categoryColor?: string | null }> };

export type CreateTransactionMutationVariables = Exact<{
  input: CreateTransactionInput;
}>;


export type CreateTransactionMutation = { __typename?: 'RootMutationType', createTransaction?: { __typename?: 'Transaction', id: string, amount: number, type: TransactionType, date: string, description: string, categoryId: string, accountId: string } | null };

export type UpdateTransactionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTransactionInput;
}>;


export type UpdateTransactionMutation = { __typename?: 'RootMutationType', updateTransaction?: { __typename?: 'Transaction', id: string, amount: number, type: TransactionType, date: string, description: string, categoryId: string, accountId: string } | null };

export type DeleteTransactionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTransactionMutation = { __typename?: 'RootMutationType', deleteTransaction?: boolean | null };


export const GetAllAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAllAccountsQuery, GetAllAccountsQueryVariables>;
export const GetAccountBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAccountBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<GetAccountBalanceQuery, GetAccountBalanceQueryVariables>;
export const GetTotalBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTotalBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalBalance"}},{"kind":"Field","name":{"kind":"Name","value":"accountsCount"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"totalIncome"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpense"}}]}}]}}]}}]} as unknown as DocumentNode<GetTotalBalanceQuery, GetTotalBalanceQueryVariables>;
export const CreateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<CreateAccountMutation, CreateAccountMutationVariables>;
export const UpdateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateAccountMutation, UpdateAccountMutationVariables>;
export const DeleteAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const GetCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const GetCategoryByNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCategoryByName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryByName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetCategoryByNameQuery, GetCategoryByNameQueryVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const DeleteCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const GetMonthSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMonthSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalIncome"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"byCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]} as unknown as DocumentNode<GetMonthSummaryQuery, GetMonthSummaryQueryVariables>;
export const GetTransactionsByDateRangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTransactionsByDateRange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsByDateRange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"categoryColor"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalIncome"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<GetTransactionsByDateRangeQuery, GetTransactionsByDateRangeQueryVariables>;
export const GetAllTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllTransactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}}]}}]}}]} as unknown as DocumentNode<GetAllTransactionsQuery, GetAllTransactionsQueryVariables>;
export const GetTransactionsByAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTransactionsByAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsByAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}}]}}]}}]} as unknown as DocumentNode<GetTransactionsByAccountQuery, GetTransactionsByAccountQueryVariables>;
export const GetTransactionsByCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTransactionsByCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsByCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"categoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<GetTransactionsByCategoryQuery, GetTransactionsByCategoryQueryVariables>;
export const GetTransactionsByTypeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTransactionsByType"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsByType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<GetTransactionsByTypeQuery, GetTransactionsByTypeQueryVariables>;
export const GetTransactionsByRecurrenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTransactionsByRecurrence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frequency"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecurrenceFrequency"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsByRecurrence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"frequency"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frequency"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}},{"kind":"Field","name":{"kind":"Name","value":"recurrence"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"interval"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfMonth"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<GetTransactionsByRecurrenceQuery, GetTransactionsByRecurrenceQueryVariables>;
export const GetTransactionsForMonthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTransactionsForMonth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsForMonth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"categoryColor"}}]}}]}}]} as unknown as DocumentNode<GetTransactionsForMonthQuery, GetTransactionsForMonthQueryVariables>;
export const CreateTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTransactionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}}]}}]}}]} as unknown as DocumentNode<CreateTransactionMutation, CreateTransactionMutationVariables>;
export const UpdateTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTransactionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}}]}}]}}]} as unknown as DocumentNode<UpdateTransactionMutation, UpdateTransactionMutationVariables>;
export const DeleteTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTransactionMutation, DeleteTransactionMutationVariables>;