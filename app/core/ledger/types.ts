/**
 * @type user book keeping
 */
export type Book = {
  id: string;
  name: string;
  createdAt: number;
};

/**
 * Account Type
 */
export type AccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "EXPENSE"
  | "INCOME";

export type Account = {
  id: string;
  name: string;
  code?: string;
  accountType: AccountType;
};

export type TransactionEntry = {
  id?: string;
  account: string;
  amount: number;
  memo?: string;
};

export type TransactionRaw = {
  id: string;
  description: string;
  datePosting: number;
  dateEntry: number;
  entries: TransactionEntry[];
};

export type Transaction = {
  id: string;
  trx_id: string;
  account_id: string;
  amount: number;
  description: string;
  memo?: string;
  datePosting: number;
  dateEntry: number;
};

export type TransactionWithAccount = Transaction & {
  account: Account;
};
