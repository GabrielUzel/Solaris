import { useState } from "react";
import type { TransactionFilter } from "./types";

export function useTransactionFilter(
  initial: TransactionFilter = { kind: "all" },
) {
  const [filter, setFilter] = useState<TransactionFilter>(initial);
  return { filter, setFilter };
}
