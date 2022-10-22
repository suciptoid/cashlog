import type { AccountCreate, AccountWithBalance } from "./account";
import {
  AccountBalanceFromSnapshot,
  AccountBalanceSchema,
  AccountFromSnapshot,
  AccountSchema,
  shouldFlipBalance,
} from "./account";
import { BookNotExists } from "./errors";
import type { JournalCreate, JournalData, JournalEntry } from "./journal";
import { Journal, JournalSchema } from "./journal";
import { z } from "zod";
import dayjs, { day } from "~/lib/dayjs";
import { database } from "~/lib/firebase.server";
import { generateId } from "~/lib/id";

export const BookInfoSchema = z.object({
  timestamp: z.number(),
  id: z.string(),
  name: z.string(),
  currency: z.string().default("IDR"),
  timezone: z.string().default("UTC"),
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

  async getBookOffset() {
    if (!this.info) {
      this.info = await this.getBookInfo();
    }
    const offset = day().tz(this.info.timezone).utcOffset();
    return offset;
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

  async getData(date?: number) {
    const all = await Promise.all([
      this.getAccounts(), // 0
      this.getBookInfo(), // 1
      this.getJournals(date), // 2
      this.getPreviousBalance(date), // 3
    ]);

    const journals = all[2];
    const bookInfo = all[1];
    const prevBalance = all[3];

    const transactions = Journal.flatten(journals);

    const accounts = all[0].map((acc) => {
      const result = {
        ...acc,
        balance_raw: transactions
          .filter((f) => f.account == acc.id)
          .reduce((bal, trx) => {
            return bal + trx.amount;
          }, 0),
      };
      // If has previous balance
      const prev = prevBalance.find((f) => f.account == acc.id);
      if (prev) {
        result.balance_raw += prev.balance;
      }
      if (shouldFlipBalance(result) && result.balance_raw != 0) {
        result.balance = result.balance_raw * -1;
      } else {
        result.balance = result.balance_raw;
      }
      return result;
    });

    return {
      journals,
      accounts,
      info: bookInfo,
      prev_balance: prevBalance,
    };
  }

  async getPreviousBalance(curentPeriod?: number) {
    const offset = await this.getBookOffset();
    const lastPeriod = dayjs(curentPeriod)
      .utcOffset(offset)
      .subtract(1, "month")
      .endOf("month")
      .valueOf();

    const ref = this.ref.child(`balance/account/monthly`);
    const result = await ref.orderByChild("date").equalTo(lastPeriod).get();

    if (!result.exists()) {
      return [];
    }

    return AccountBalanceFromSnapshot.parse(result.val());
  }

  async setInfo(info: Partial<BookInfo>) {
    await this.ref.child("info").set(info);
    const parsed = BookInfoSchema.parse(info);

    return parsed;
  }

  async setAccountBalance(
    period: number,
    { account, balance }: { account: string; balance: number }
  ) {
    const offset = await this.getBookOffset();
    const date = dayjs(period).utcOffset(offset).endOf("month").valueOf();
    const ref = this.ref.child(`balance/account/monthly/${date}-${account}`);
    const accBalance = AccountBalanceSchema.parse({
      account,
      balance,
      date,
      timestamp: Date.now(),
    });
    console.log("set account balance", accBalance);
    await ref.set(accBalance);
    return accBalance;
  }

  async getBookInfo(): Promise<BookInfo> {
    const info = await this.ref.child("info").get();
    if (!info.exists()) {
      throw new BookNotExists();
    }

    const parsed = BookInfoSchema.parse(info.val());
    // Set default timezone to book timezone
    return parsed;
  }

  async delete() {
    // TODO: Delete user referene
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

  async getJournals(period?: number) {
    const ref = this.journalRef;
    const offset = await this.getBookOffset();

    // Start and end period for defined month based on book timezone
    const start = day(period).utcOffset(offset).startOf("month").valueOf();
    const end = day(period).utcOffset(offset).endOf("month").valueOf();

    // Get previous balance

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
      if (shouldFlipBalance(result) && result.balance_raw != 0) {
        result.balance = result.balance_raw * -1;
      } else {
        result.balance = result.balance_raw;
      }
      return result;
    });

    return this.accounts;
  }
}
