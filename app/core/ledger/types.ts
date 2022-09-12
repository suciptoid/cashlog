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
  description?: string;
  parentId?: string;
  // comodity_id: string; // commodity can be currency, stocks, mutual funds, etc
  accountType: AccountType;
};

export type AccountWithBalance = Account & {
  balance: number;
};

export type AccountTree = AccountWithBalance & {
  subAccounts: AccountTree[];
};

export type TransactionEntry = {
  id?: string;
  account: string;
  amount: number;
  memo?: string;
};

export type Transaction = {
  id: string;
  description: string;
  datePosting: number;
  dateEntry: number;
  entries: TransactionEntry[];
};

export type TransactionSingle = {
  id: string;
  trx_id: string;
  account_id: string;
  amount: number;
  description: string;
  memo?: string;
  datePosting: number;
  dateEntry: number;
};

export type TransactionWithAccount = TransactionSingle & {
  account: Account;
};
