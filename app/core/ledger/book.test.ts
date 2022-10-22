import { AccountType } from "./account";
import { Book } from "./book";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import dayjs, { day } from "~/lib/dayjs";

describe("Core Book", () => {
  it("set timezone correctly", async () => {
    const book = await Book.create({
      name: "Test Book",
      currency: "IDR",
      timezone: "UTC",
    });

    const offset = await book.getBookOffset();
    const bookDayjs = day().utcOffset(offset);

    expect(book.info?.timezone).toEqual("UTC");
    expect(bookDayjs.isUTC()).toEqual(true);
    await book.delete();

    const bookJkt = await Book.create({
      name: "Book Jakarta",
      currency: "IDR",
      timezone: "Asia/Jakarta",
    });
    const offsetJkt = await bookJkt.getBookOffset();
    const bookJktDay = day().utcOffset(offsetJkt);
    expect(bookJkt.info?.timezone).toEqual("Asia/Jakarta");
    expect(bookJktDay.isUTC()).toEqual(false);
    expect(bookJktDay.utcOffset()).toEqual(420);
    await bookJkt.delete();
  });

  describe("Previous balance", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("create account also set previous balance to 0", async () => {
      const book = await Book.create({
        name: "Test",
        currency: "IDR",
        timezone: "Asia/Jakarta",
      });

      const date = dayjs.tz("2022-01-01", "Asia/Jakarta");
      vi.setSystemTime(date.toDate());
      const accAsset = await book.createAccount({
        currency: "IDR",
        name: "Asset",
        type: AccountType.Asset,
      });
      expect(accAsset.id).toBeDefined();
      const prevs = await book.getPreviousBalance(date.valueOf());
      expect(prevs).toHaveLength(1);
      expect(prevs[0].account).toEqual(accAsset.id);

      // Create dummy journal entry
      const accEquity = await book.createAccount({
        currency: "IDR",
        name: "Equity",
        type: AccountType.Equity,
      });
      expect(accEquity.id).toBeDefined();

      await book.createJournal({
        description: "Opening balance",
        date: date.add(2, "day").valueOf(),
        entries: [
          {
            account: accAsset.id,
            amount: 500000,
          },
          {
            account: accEquity.id,
            amount: -500000,
          },
        ],
      });
      const data = await book.getData();
      expect(data.journals).toHaveLength(1);
      const findAsset = data.accounts.find((f) => f.id == accAsset.id);
      expect(findAsset).toBeDefined();
      expect(findAsset?.balance).toBe(500000);

      // move to next month
      const nextMonth = date.add(1, "month");
      vi.setSystemTime(nextMonth.toDate());
      await book.createJournal({
        description: "Deposit",
        date: nextMonth.add(2, "day").valueOf(),
        entries: [
          {
            account: accAsset.id,
            amount: 500000,
          },
          {
            account: accEquity.id,
            amount: -500000,
          },
        ],
      });

      const nextData = await book.getData();
      expect(nextData.journals).toHaveLength(1);
      expect(nextData.prev_balance).toHaveLength(2);
      const nextAsset = nextData.accounts.find((f) => f.id == accAsset.id);
      expect(nextAsset).toBeDefined();
      expect(nextAsset?.balance).toEqual(1000000);

      // After 3 month no transaction
      const threeMonth = nextMonth.add(3, "month");
      vi.setSystemTime(threeMonth.toDate());

      await book.createJournal({
        description: "Deposit on may",
        date: threeMonth.valueOf(),
        entries: [
          {
            account: accAsset.id,
            amount: 500000,
          },
          {
            account: accEquity.id,
            amount: -500000,
          },
        ],
      });

      const threeData = await book.getData();
      expect(threeData.journals).toHaveLength(1);
      expect(threeData.prev_balance).toHaveLength(2);
      const threeAsset = threeData.accounts.find((f) => f.id == accAsset.id);
      expect(threeAsset).toBeDefined();
      expect(threeAsset?.balance).toEqual(1500000);

      // Switch to end of year
      const eoy = dayjs.tz("2022-12-12", "Asia/Jakarta");
      vi.setSystemTime(eoy.toDate());
      const eoyData = await book.getData();

      expect(eoyData.journals).toHaveLength(0);
      expect(eoyData.prev_balance).toHaveLength(2);
      const eoyAsset = eoyData.accounts.find((f) => f.id == accAsset.id);
      expect(eoyAsset).toBeDefined();
      expect(eoyAsset?.balance).toEqual(1500000);

      await book.delete();
    });

    afterEach(() => {
      vi.useRealTimers();
    });
  });
});
