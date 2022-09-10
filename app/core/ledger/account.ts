import { getTransaction } from "./transaction";
import type { Account, AccountWithBalance, Transaction } from "./types";
import cuid from "cuid";
import { database } from "~/lib/firebase.server";

export const rootAccounts: Partial<Account>[] = [
  {
    accountType: "ASSET",
    name: "Asset",
  },
  {
    accountType: "LIABILITY",
    name: "Liability",
  },
  {
    accountType: "EQUITY",
    name: "Equity",
  },
  {
    accountType: "INCOME",
    name: "Income",
  },
  {
    accountType: "EXPENSE",
    name: "Expense",
  },
];

export const createAccount = async (
  book: string,
  account: Omit<Account, "id"> & Partial<Pick<Account, "id">>
) => {
  let id = cuid();
  if (account.id) {
    id = account.id;
  }
  const ref = database.ref(`/books/${book}/accounts/${id}`);

  const acc = {
    ...account,
    id: id,
  } as Account;

  await ref.set(acc);
  return acc;
};

export const getAccounts = async (book: string) => {
  const ref = database.ref(`/books/${book}/accounts`);

  const snapshots = await ref.get();

  const data: Account[] = [];
  snapshots.forEach((snap) => {
    data.push(snap.val());
  });
  return data;
};

export const getAccountTransactions = async (
  book: string,
  start: number,
  end: number,
  account?: string
) => {
  const transactions = await getTransaction(book, start, end);
  // Flatten transactions entries
  return transactions.reduce((all, val) => {
    let entries = val.entries.map((trx) => {
      return {
        id: trx.id,
        account_id: trx.account,
        amount: trx.amount,
        dateEntry: val.dateEntry,
        datePosting: val.datePosting,
        description: val.description,
        trx_id: val.id,
        memo: trx.memo,
      } as Transaction;
    });
    if (account) {
      entries = entries.filter((f) => f.account_id == account);
    }
    return all.concat(entries);
  }, [] as Transaction[]);
};

export const getAccountBalance = async (
  book: string,
  start: number,
  end: number
) => {
  const transactions = await getAccountTransactions(book, start, end);
  const accounts = await getAccounts(book);
  // TODO: get previous balance (cached)

  return accounts.map((acc) => {
    return {
      ...acc,
      balance: transactions
        .filter((f) => f.account_id == acc.id)
        .reduce((sum, tr) => {
          return sum + tr.amount;
        }, 0),
    } as AccountWithBalance;
  });
};

export const createRootAccount = async (book: string) => {
  for (let x = 0; x < rootAccounts.length; x++) {
    const acc = rootAccounts[x];
    await createAccount(book, acc as Account);
  }
};
