import type { LoaderArgs } from "@remix-run/node";
import { Link, Outlet, useLocation, useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { z } from "zod";
import { PageHeader } from "~/components/PageHeader";
import { Book } from "~/core/ledger";
import dayjs from "~/lib/dayjs";

export const BookParams = z.object({
  book: z.string().min(10),
});

export const loader = async ({ request, params }: LoaderArgs) => {
  const p = BookParams.parse(params);
  const book = Book.withId(p.book);
  await book.loadAll();

  return book;
};

export default function BookPage() {
  const location = useLocation();
  return (
    <div>
      <PageHeader>
        <div className="flex items-center h-full px-8">
          <h1 className=" font-bold text-gray-800">
            {dayjs().format("YYYY MMMM")}
          </h1>
          <div className="flex-1"></div>
          <Link
            to={`./entry?redirect=${location.pathname}`}
            className="bg-green-500 text-white rounded px-3 py-2 text-sm"
          >
            New Journal Entry
          </Link>
          {/* <JournalEntryDialog /> */}
        </div>
      </PageHeader>
      <Outlet />
    </div>
  );
}

export function useBookData() {
  const matches = useMatches();
  const data = useMemo(() => {
    const period = matches.find((f) => f.id == "routes/book/$book");
    return period?.data as Awaited<ReturnType<typeof loader>>;
  }, [matches]);

  return data;
}
