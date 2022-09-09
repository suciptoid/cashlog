import type { Book } from "./types";
import { database } from "~/lib/firebase.server";

/**
 *
 * @param id book id
 * @param name book name
 * @returns Book
 */

export const createBook = async (id: string, name: string) => {
  const ref = database.ref(`/books/${id}`);
  const existing = await ref.get();
  if (existing.exists()) {
    throw Error("Book already exists");
  }
  const book = {
    id,
    name,
    createdAt: Date.now(),
  };
  await ref.set(book);
  return book as Book;
};
/**
 *
 * @param id book id
 * @returns void
 */

export const deleteBook = async (id: string) => {
  const ref = database.ref(`/books/${id}`);
  return await ref.remove();
};
