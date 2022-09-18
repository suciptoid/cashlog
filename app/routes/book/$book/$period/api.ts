import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Book } from "~/core/ledger";
import { requireUser } from "~/lib/cookies";

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await requireUser(request);
  console.log("user", user);
  const book = Book.withId(params.book!);
  await book.loadAll();
  return json(book);
};
