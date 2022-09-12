import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import { getBook, getUserBookkeeping } from "~/core/ledger/book";
import { requireUser } from "~/lib/cookies";

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await requireUser(request);
  if (!user) {
    throw redirect("/auth");
  }

  if (!params.book) {
    const books = await getUserBookkeeping(user.user_id);
    const url = new URL(request.url);

    if (books.length == 0 && url.pathname != "/book/setup") {
      console.log(request.url);
      throw redirect("/book/setup");
    } else if (books.length == 1) {
      console.log("first book", books);
      throw redirect(`/book/${books[0].id}/accounts`);
    }
  } else {
    const book = await getBook(params.book!);
    return { user, book };
  }

  return { user };
};

export default function DashboardIndex() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main className="relative flex h-screen w-screen flex-col md:flex-row">
      <Sidebar user={user} />

      <div
        id="dashboard-page"
        className="sticky flex h-screen flex-grow flex-col overflow-y-auto"
      >
        <Outlet />
      </div>
    </main>
  );
}