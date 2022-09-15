import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { PageHeader } from "~/components/PageHeader";
import { getAccounts } from "~/core/ledger/account";
import { createTransaction } from "~/core/ledger/transaction";
import type { TransactionEntry } from "~/core/ledger/types";

export default function EntryPage() {
  const { accounts } = useLoaderData<typeof loader>();
  const [entries, setEntries] = useState<TransactionEntry[]>([
    {
      account: "",
      amount: 0,
    },
    {
      account: "",
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
    <div id="form-entry" className="">
      <PageHeader>
        <div className="flex items-center h-full px-8">
          <h1 className=" font-bold text-gray-800">New Journal Entry</h1>
          <div className="flex-1"></div>
          <Link to="./..">Cancel</Link>
        </div>
      </PageHeader>
      <Form method="post" replace className="px-8 py-2">
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
              onChange={(e) => updateEntries(idx, { account: e.target.value })}
            >
              {accounts.map((acc) => (
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
              defaultValue={m.memo}
              onChange={(e) => updateEntries(idx, { memo: e.target.value })}
            />
            <input
              type="number"
              defaultValue={m.amount}
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
          onClick={() => setEntries([...entries, { account: "", amount: 0 }])}
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
      </Form>
    </div>
  );
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const accounts = await getAccounts(params.book!);
  return { accounts };
};

export const action = async ({ request, params }: ActionArgs) => {
  const form = await request.formData();
  // const data = Object.fromEntries(form.entries());

  const memos = form.getAll("memo");
  const amounts = form.getAll("amount");
  const entries = form.getAll("account").map((acc, idx) => {
    return {
      account: acc.toString(),
      amount: parseInt(amounts[idx].toString()),
      memo: memos[idx].toString(),
    } as TransactionEntry;
  });

  await createTransaction(params.book!, {
    dateEntry: Date.now(),
    datePosting: Date.now(),
    description: form.get("description")?.toString() || "",
    entries,
  });

  // return redirect("./");
  const referer = request.headers.get("Referer");
  const search = new URL(request.url);
  console.log("search param", search.searchParams.get("redirect"), search);
  return redirect(search.searchParams.get("redirect") || referer || "/book");
  // return data;
};
