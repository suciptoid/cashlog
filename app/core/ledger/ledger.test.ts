import { Book } from ".";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import rules from "~/database-rules.json";
import { day } from "~/lib/dayjs";
import { database } from "~/lib/firebase.server";
import { generateId } from "~/lib/id";

describe("Ledger Class", () => {
  beforeAll(async () => {
    // Set rules
    const res = await fetch(
      "http:/127.0.0.1:9999/.settings/rules.json?access_token=123&ns=test",
      {
        method: "PUT",
        body: JSON.stringify(rules),
      }
    );
    expect(res.status).toEqual(200);
  });

  describe("Book", () => {
    const id = generateId();
    const ref = database.ref(`/books/${id}/info`);
    beforeEach(async () => {
      await ref.set({
        id: id,
        timestamp: Date.now(),
        name: "Book 1",
      });
    });
    afterEach(async () => {
      await ref.remove();
    });

    it("Get book from id", async () => {
      const book = Book.withId(id);
      expect(book.id).toEqual(id);
      const info = await book.getBookInfo();
      expect(info.name).toEqual("Book 1");
    });

    describe("Journal", () => {
      const id = "journal-" + generateId();
      afterEach(async () => {
        await Book.withId(id).delete();
      });

      it("create journal entry", async () => {
        const book = Book.withId(id);
        await book.createJournal({
          date: day("2022-09-09").valueOf(),
          description: "Create manual journal entry",
          entries: [
            {
              account: "Expense",
              amount: 100,
            },
            {
              account: "Asset",
              amount: -100,
            },
          ],
        });

        const journals = await book.getJournals(day("2022-09-09").valueOf());
        expect(journals.length).toBe(1);
        expect(journals[0].entries.length).toEqual(2);
      });

      it("throw error on unbalance entry", async () => {
        const book = Book.withId(id);
        expect(
          book.createJournal({
            date: day("2022-09-09").valueOf(),
            description: "Create unbalance journal entry",
            entries: [
              {
                account: "Expense",
                amount: 50,
              },
              {
                account: "Asset",
                amount: -100,
              },
            ],
          })
        ).rejects.toThrow();
      });
    });

    describe("Account", () => {
      const id = generateId();
      afterAll(async () => {
        await Book.withId(id).delete();
      });

      it("get all accounts", async () => {
        const book = Book.withId(id);
        const accId = generateId();

        expect((await book.getAccounts()).length).toEqual(0);
        await book.ref.child("accounts").child(accId).set({
          id: accId,
          name: "Asset",
          type: "ASSET",
        });
        const accs = await book.getAccounts();
        expect(accs.length).toEqual(1);
      });
    });
  });
});
