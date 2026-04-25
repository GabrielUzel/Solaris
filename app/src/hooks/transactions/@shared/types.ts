import type {
  TransactionType,
  RecurrenceFrequency,
} from "../../../gql/graphql";

export type TransactionFilter =
  | { kind: "all" }
  | { kind: "by-account"; accountId: string }
  | { kind: "by-category"; categoryId: string }
  | { kind: "by-type"; transactionType: TransactionType }
  | { kind: "by-recurrence"; frequency: RecurrenceFrequency }
  | { kind: "by-month"; accountId: string; year: number; month: number }
  | {
      kind: "by-date-range";
      accountId: string;
      startDate: string;
      endDate: string;
    };
