import { Book } from "./book";
import { describe, expect, it } from "vitest";
import { day } from "~/lib/dayjs";

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
});
