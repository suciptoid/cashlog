import { useBookData } from "../$period";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import qs from "qs";
import { z } from "zod";
import { Book } from "~/core/ledger";
import { AccountType } from "~/core/ledger/account";

// import { createAccount, getAccounts } from "~/core/ledger/account";

export default function AddAccountPage() {
  // const { accounts } = useLoaderData<typeof loader>();
  const { accounts } = useBookData();
  return (
    <div>
      <h1 className="px-3 py-2 font-semibold text-gray-800">Add Account</h1>
      <Form method="post" replace className="px-3 py-2">
        <fieldset className="py-2 flex flex-col">
          <label htmlFor="name" className="text-sm font-medium text-gray-500">
            Account Name
          </label>
          <input
            className="px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-100 border border-gray-200 rounded"
            type="text"
            name="name"
            id="name"
            placeholder="Account Name"
          />
        </fieldset>
        <fieldset className="py-2 flex flex-col">
          <label className="text-sm font-medium text-gray-500" htmlFor="type">
            Account Type
          </label>
          <select
            className="px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-100 border border-gray-200 rounded"
            name="type"
            id="type"
          >
            <option value="ASSET">Asset</option>
            <option value="LIABILITY">Liability</option>
            <option value="EQUITY">Equity</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </fieldset>
        <fieldset className="py-2 flex flex-col">
          <label className="text-sm font-medium text-gray-500" htmlFor="parent">
            Parent Account
          </label>
          <select
            className="px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-100 border border-gray-200 rounded"
            name="parent"
            id="parent"
          >
            <option value="">Top Level (Root Account)</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset className="py-2 flex flex-col">
          <label
            className="text-sm font-medium text-gray-500"
            htmlFor="description"
          >
            Description
          </label>
          <input
            className="px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-100 border border-gray-200 rounded"
            type="text"
            name="description"
            id="description"
            placeholder="description"
          />
        </fieldset>
        <button
          className="bg-teal-500 text-white px-3 py-2 rounded"
          type="submit"
        >
          Create Account
        </button>
      </Form>
    </div>
  );
}

const CreateAccountDTO = z.object({
  name: z.string().min(3),
  parent: z.string().optional(),
  type: z.nativeEnum(AccountType),
  description: z.string().optional(),
});

export const action = async ({ request, params }: ActionArgs) => {
  const data = await request.text();
  const parsed = CreateAccountDTO.parse(qs.parse(data));
  const acc = await Book.withId(params.book!).createAccount(parsed);

  console.log("create account", acc);

  return redirect(`/book/${params.book}`);
};

export const loader = async ({ request, params }: LoaderArgs) => {
  // const accounts = await getAccounts(params.book!);
  // return { accounts };
  return null;
};
