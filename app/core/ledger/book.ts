import type { AccountCreate, AccountWithBalance } from "./account";
import {
  AccountFromSnapshot,
  AccountSchema,
  shouldFlipBalance,
} from "./account";
import { BookNotExists } from "./errors";
import type { JournalCreate, JournalData, JournalEntry } from "./journal";
import { Journal, JournalSchema } from "./journal";
import { z } from "zod";
import { day } from "~/lib/dayjs";
import { database } from "~/lib/firebase.server";
import { generateId } from "~/lib/id";

export const BookInfoSchema = z.object({
  timestamp: z.number(),
  id: z.string(),
  name: z.string(),
  currency: z.string().default("IDR"),
});

const CreateBookInfoSchema = BookInfoSchema.omit({ id: true, timestamp: true });

type BookInfo = z.infer<typeof BookInfoSchema>;
type BookInfoCreate = z.infer<typeof CreateBookInfoSchema>;

export class Book {
  id: string;
  journals: JournalData[] = [];
  info?: BookInfo;
  accounts: AccountWithBalance[] = [];

  constructor(id: string) {
    this.id = id;
  }

  get ref() {
    if (!this.id) {
      throw new Error("Book id not defined");
    }
    return database.ref(`/books/${this.id}`);
  }

  get journalRef() {
    return this.ref.child("journals");
  }

  static withId(id: string, load = false) {
    const book = new Book(id);
    return book;
  }

  static async create(info: BookInfoCreate) {
    const id = generateId();

    const book = Book.withId(id);
    await book.setInfo({
      ...info,
      id,
      timestamp: Date.now(),
    });

    return book;
  }

  static async getUserBook(id: string) {
    const snapshots = await database.ref(`/users/${id}/bookkeepings`).get();
    const books: Book[] = [];

    snapshots.forEach((snap) => {
      books.push(Book.withId(snap.key!));
    });
    return books;
  }

  async exists() {
    return (await this.ref.child("info").get()).exists();
  }

  async addUser(id: string) {
    const userRef = database.ref(`/users/${id}/bookkeepings/${this.id}`);
    const userSet = userRef.set({
      timestamp: Date.now(),
    });
    const bookSet = this.ref.child("info").child("users").child(id).set({
      timestamp: Date.now(),
    });
    const write = await Promise.all([userSet, bookSet]);
    console.log("write", write);
  }

  async loadAll() {
    const all = await Promise.all([
      this.getAccounts(),
      this.getBookInfo(),
      this.getJournals(),
    ]);
    // console.log("load all", all);

    this.accounts = all[0];
    this.info = all[1];
    this.journals = all[2];

    this.getAccountBalance();
  }

  async setInfo(info: Partial<BookInfo>) {
    await this.ref.child("info").set(info);
    return info;
  }

  async getBookInfo(): Promise<BookInfo> {
    const info = await this.ref.child("info").get();
    if (!info.exists()) {
      throw new BookNotExists();
    }

    return BookInfoSchema.parse(info.val());
  }

  async delete() {
    return await this.ref.remove();
  }

  async createJournal(journal: JournalCreate) {
    const id = generateId();
    const ref = this.journalRef.child(id);

    const entries: any = {};

    let balance = 0;
    journal.entries.forEach((e) => {
      const id = generateId();
      entries[id] = {
        ...e,
        id,
      };
      balance += e.amount;
    });

    if (balance !== 0) {
      throw new Error("Total journal entry should 0, but got " + balance);
    }

    await ref.set({
      ...journal,
      id,
      timestamp: Date.now(),
      entries,
    });
  }

  async getJournals(month?: number) {
    const ref = this.journalRef;
    const start = day(month).startOf("month").valueOf();
    const end = day(month).endOf("month").valueOf();

    const snapshots = await ref
      .orderByChild("date")
      .startAt(start)
      .endAt(end)
      .get();

    const data: JournalData[] = [];

    snapshots.forEach((snap) => {
      const raw = snap.val();
      const trx: JournalData = raw;

      const entries: JournalEntry[] = [];
      snap.child("entries").forEach((entry) => {
        entries.push(entry.val());
      });

      trx.entries = entries;
      data.push(JournalSchema.parse(trx));
    });

    return data;
  }

  async getAccounts() {
    const snaps = await this.ref.child("accounts").get();
    if (!snaps.exists()) {
      return [];
    }
    // const parsed = AccountSnapshot.parse(new Map(Object.entries(snaps.val())));
    // console.log("getaccounts", AccountFromSnapshot.parse(snaps.val()));
    // return Array.from(parsed.values());
    return AccountFromSnapshot.parse(snaps.val());
  }

  async createAccount(account: AccountCreate) {
    const id = generateId();
    const acc = AccountSchema.parse({
      ...account,
      id,
    });
    await this.ref.child("accounts").child(id).set(acc);
    return acc;
  }

  getAccountBalance() {
    const transactions = Journal.flatten(this.journals);

    this.accounts = this.accounts.map((acc) => {
      const result = {
        ...acc,
        balance_raw: transactions
          .filter((f) => f.account == acc.id)
          .reduce((bal, trx) => {
            return bal + trx.amount;
          }, 0),
      };
      console.log("get account balance", shouldFlipBalance(result), result);
      if (shouldFlipBalance(result)) {
        console.log(result);
        result.balance = result.balance_raw * -1;
      } else {
        result.balance = result.balance_raw;
      }
      return result;
    });

    return this.accounts;
  }
}
