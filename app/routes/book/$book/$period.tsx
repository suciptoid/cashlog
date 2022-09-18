import * as Dialog from "@radix-ui/react-dialog";
import type { LoaderArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  useFetcher,
  useLocation,
  useMatches,
  useParams,
} from "@remix-run/react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { PageHeader } from "~/components/PageHeader";
import { Book } from "~/core/ledger/book";
import type { TransactionEntry } from "~/core/ledger/types";
import dayjs from "~/lib/dayjs";

export default function RangePage() {
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
            className="bg-teal-500 text-white rounded px-3 py-2 text-sm"
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

export const BookParams = z.object({
  book: z.string().min(10),
});

export const loader = async ({ request, params }: LoaderArgs) => {
  const p = BookParams.parse(params);
  const book = Book.withId(p.book);
  await book.loadAll();

  return book;
};

export function useBookData() {
  const matches = useMatches();
  const data = useMemo(() => {
    const period = matches.find((f) => f.id == "routes/book/$book/$period");
    return period?.data as Awaited<ReturnType<typeof loader>>;
  }, [matches]);

  return data;
}

export function JournalEntryDialog() {
  const params = useParams();
  const { accounts } = useBookData();
  const fetcher = useFetcher();
  const [entries, setEntries] = useState<TransactionEntry[]>([
    {
      account: "",
      memo: "",
      amount: 0,
    },
    {
      account: "",
      memo: "",
      amount: 0,
    },
  ]);

  const updateEntries = (index: number, data: Partial<TransactionEntry>) => {
    const updated = entries.map((e, i) => {
      if (i == index)
        return {
          ...e,
          ...data,
        };

      return e;
    });
    setEntries(updated);
  };

  return (
    <Dialog.Root defaultOpen={false}>
      <Dialog.Trigger asChild>
        <button className="px-3 py-2 text-white bg-teal-500 rounded">
          New Journal Entry
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="fixed left-0 top-0 w-full h-screen bg-black bg-opacity-10 flex items-center justify-center">
        <div className="bg-white px-4 py-4 rounded w-full max-w-4xl m-auto">
          <div className="w-full m-auto max-w-6xl flex flex-col">
            <h2 className="text-lg font-bold">Journal Entry</h2>
          </div>
          {JSON.stringify(entries)}
          <fetcher.Form method="post" action={`/book/${params.book}/entry`}>
            <fieldset className="py-2 flex flex-col">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-500"
              >
                Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                className="px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-100 border border-gray-200 rounded"
                placeholder="description"
              />
            </fieldset>
            {entries.map((m, idx) => (
              <fieldset
                key={idx}
                className="px-3 py-2 border my-1 flex items-center"
              >
                <select
                  name="account"
                  defaultValue={m.account}
                  onChange={(e) =>
                    updateEntries(idx, { account: e.target.value })
                  }
                >
                  {accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name={`memo`}
                  className="flex-1"
                  placeholder="Memo"
                  onChange={(e) => updateEntries(idx, { memo: e.target.value })}
                />
                <input
                  type="number"
                  onChange={(e) =>
                    updateEntries(idx, { amount: Number(e.target.value) })
                  }
                  name={`amount`}
                  placeholder="Amount"
                />
              </fieldset>
            ))}
            <button
              type="button"
              className="py-2 text-xs px-1 font-medium text-gray-600"
              onClick={() =>
                setEntries([...entries, { account: "", amount: 0 }])
              }
            >
              Add More Row
            </button>
            <fieldset className="flex justify-end">
              <button
                type="submit"
                className="bg-teal-500 text-white px-3 py-2 rounded"
              >
                Create Entry
              </button>
            </fieldset>
          </fetcher.Form>
        </div>
        {/* <Dialog.Close asChild>
          <button className="">
            <span className="hidden font-mono md:block">esc</span>
          </button>
        </Dialog.Close> */}
      </Dialog.Content>
    </Dialog.Root>
  );
}
