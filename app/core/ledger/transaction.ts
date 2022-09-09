import type {
  Account,
  Transaction,
  TransactionEntry,
  TransactionRaw,
} from "./types";
import { database } from "~/lib/firebase.server";

export const createTransaction = async (
  book: string,
  transaction: TransactionRaw
) => {
  const ref = database.ref(`/books/${book}/transactions`);
  const trx = ref.push();
  const id = trx.key;

  const data = {
    ...transaction,
    id: id,
  } as TransactionRaw;

  if (transaction.entries.length < 2) {
    throw Error("Transaction at least have 2 entries");
  }

  const entries: any = {};
  let total = 0;
  transaction.entries.forEach((entry) => {
    const id = ref.push().key!;
    entries[id] = {
      ...entry,
      id,
    };
    total += entry.amount;
  });
  data.entries = entries;

  if (total !== 0) {
    throw Error(`Total amount not balance (${total}), should be 0.`);
  }

  await trx.set(data);
};

export const createAccount = async (
  book: string,
  account: Omit<Account, "id"> & Partial<Pick<Account, "id">>
) => {
  const ref = database.ref(`/books/${book}/accounts`);
  const trx = ref.push();
  const id = trx.key;

  const acc = {
    ...account,
    id: id,
  } as Account;

  await trx.set(acc);
  return acc;
};

export const getTransaction = async (
  book: string,
  start: number,
  end: number
) => {
  const ref = database.ref(`/books/${book}/transactions`);

  const snapshots = await ref
    .orderByChild("datePosting")
    .startAt(start)
    .endAt(end)
    .get();

  const data: TransactionRaw[] = [];

  // Map snapshot into collection
  snapshots.forEach((snap) => {
    const raw = snap.val();
    const trx: TransactionRaw = raw;

    // Map Entries
    const entries: TransactionEntry[] = [];
    snap.child("entries").forEach((entry) => {
      entries.push(entry.val());
    });
    trx.entries = entries;
    data.push(trx);
  });

  return data;
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
