import { Book } from "./book";
import { describe, expect, it } from "vitest";

describe("Core Book", () => {
  it("set timezone correctly", async () => {
    const book = await Book.create({
      name: "Test Book",
      currency: "IDR",
      timezone: "UTC",
    });

    const bookDayjs = await book.getBookTimezone();

    expect(book.info?.timezone).toEqual("UTC");
    expect(bookDayjs.isUTC()).toEqual(true);
    await book.delete();

    const bookJkt = await Book.create({
      name: "Book Jakarta",
      currency: "IDR",
      timezone: "Asia/Jakarta",
    });
    const bookJktDay = await bookJkt.getBookTimezone();
    expect(bookJkt.info?.timezone).toEqual("Asia/Jakarta");
    expect(bookJktDay.isUTC()).toEqual(false);
    expect(bookJktDay.utcOffset()).toEqual(420);
  });
});
