import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
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
  return (
    <div id="form-entry">
      <Form method="post">
        <fieldset>
          <label htmlFor="description">Description</label>
          <input
            type="text"
            name="description"
            id="description"
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
        <fieldset>
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
  const data = Object.fromEntries(form.entries());

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

  return data;
};
