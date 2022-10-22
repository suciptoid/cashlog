import { Book } from "./book";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { day } from "~/lib/dayjs";
import { database } from "~/lib/firebase.server";
import { generateId } from "~/lib/id";

describe("Ledger Class", () => {
  describe("Book", () => {
    const id = generateId();
    const ref = database.ref(`/books/${id}/info`);

    beforeEach(async () => {
      await ref.set({
        id: id,
        timestamp: Date.now(),
        name: "Book 1",
        timezone: "UTC",
      });
    });

    afterEach(async () => {
      await Book.withId(id).delete();
    });

    it("Get book from id", async () => {
      const book = Book.withId(id);
      expect(book.id).toEqual(id);
      const info = await book.getBookInfo();
      expect(info.name).toEqual("Book 1");
    });

    describe("Journal", () => {
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
