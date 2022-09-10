import type { Book } from "./types";
import cuid from "cuid";
import { database } from "~/lib/firebase.server";

/**
 *
 * @param id book id
 * @param name book name
 * @returns Book
 */

export const createBook = async (id: string, name: string) => {
  const ref = database.ref(`/books/${id}/info`);
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

export const getBook = async (id: string) => {
  const ref = await database.ref(`/books/${id}/info`).get();
  if (!ref.exists()) {
    throw Error("Book not exists");
  }
  return ref.val() as Book;
};

export const getUserBookkeeping = async (id: string) => {
  const snapshots = await database.ref(`/users/${id}/bookkeepings`).get();
  const books: Book[] = [];

  snapshots.forEach((snap) => {
    books.push(snap.val());
  });
  return books;
};

export const createUserBookkeeping = async (userId: string, name: string) => {
  const bookId = cuid();
  const book = await createBook(bookId, name);

  const userRef = database.ref(`/users/${userId}/bookkeepings/${cuid()}`);
  await userRef.set({
    id: bookId,
    creator: userId,
    access: "full",
  });
  return book;
};
