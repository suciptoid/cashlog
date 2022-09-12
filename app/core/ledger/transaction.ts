import type { Transaction, TransactionEntry, TransactionSingle } from "./types";
import cuid from "cuid";
import { database } from "~/lib/firebase.server";

/**
 *
 * @param book book id
 * @param transaction Transaction
 */
export const createTransaction = async (
  book: string,
  transaction: Omit<Transaction, "id">
) => {
  const id = cuid();
  const ref = database.ref(`/books/${book}/transactions/${id}`);

  const data = {
    ...transaction,
    id: id,
  } as Transaction;

  if (transaction.entries.length < 2) {
    throw Error("Transaction at least have 2 entries");
  }

  const entries: any = {};
  let total = 0;
  transaction.entries.forEach((entry) => {
    const id = cuid();
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

  await ref.set(data);
  return data;
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

  const data: Transaction[] = [];

  // Map snapshot into collection
  snapshots.forEach((snap) => {
    const raw = snap.val();
    const trx: Transaction = raw;

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

export const getTransactionEntry = (transactions: Transaction[]) => {
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
      } as TransactionSingle;
    });
    return all.concat(entries);
  }, [] as TransactionSingle[]);
};
