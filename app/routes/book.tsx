import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import { Book } from "~/core/ledger/book";
import { BookNotExists } from "~/core/ledger/errors";
import { requireUser } from "~/lib/cookies";

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await requireUser(request);
  if (!user) {
    throw redirect("/auth");
  }

  if (!params.book) {
    const books = await Book.getUserBook(user.user_id);
    const url = new URL(request.url);

    if (books.length == 0 && url.pathname != "/book/setup") {
      // Redirect to setup new book
      throw redirect("/book/setup");
    } else if (books.length == 1) {
      // Redirect to first book
      console.log("first book", books);
      throw redirect(`/book/${books[0].id}/accounts`);
    }
  } else {
    try {
      const book = Book.withId(params.book);

      return { user, book };
    } catch (e) {
      if (e instanceof BookNotExists) {
        throw redirect("/book/setup");
      } else {
        throw e;
      }
    }
  }

  return { user };
};

export default function DashboardIndex() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main className="relative flex h-screen w-screen flex-col md:flex-row">
      <Sidebar user={user} />

      <div
        id="bookeeping-page"
        className="sticky flex h-screen flex-grow flex-col overflow-y-auto"
      >
        <div
          id="experiment-flag"
          className="text-center w-full bg-yellow-200 py-2 text-yellow-700 "
        >
          This page is in experimental, dont use with real data
        </div>
        <Outlet />
      </div>
    </main>
  );
}
