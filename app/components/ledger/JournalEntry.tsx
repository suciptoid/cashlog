import * as Dialog from "@radix-ui/react-dialog";
import { useFetcher, useParams } from "@remix-run/react";
import { useState } from "react";
import type { TransactionEntry } from "~/core/ledger/types";
import { useBookData } from "~/routes/book/$book/$period/__data";

export default function JournalEntry() {
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
              <fieldset key={idx} className="px-3 py-2 border my-1">
                <select name="account">
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
                <input type="text" name={`memo`} placeholder="Memo" />
                <input type="number" name={`amount`} placeholder="Amount" />
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
