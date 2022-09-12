import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { createAccount, getAccounts } from "~/core/ledger/account";
import type { Account } from "~/core/ledger/types";

export default function AddAccountPage() {
  const { accounts } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Add Account</h1>
      <Form method="post" replace>
        <fieldset>
          <label htmlFor="name">Account Name</label>
          <input type="text" name="name" id="name" placeholder="Account Name" />
        </fieldset>
        <fieldset>
          <label htmlFor="accountType">Account Type</label>
          <select name="accountType" id="accountType">
            <option value="ASSET">Asset</option>
            <option value="LIABILITY">Liability</option>
            <option value="EQUITY">Equity</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </fieldset>
        <fieldset>
          <label htmlFor="parentId">Parent Account</label>
          <select name="parentId" id="parentId">
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset>
          <label htmlFor="description">Description</label>
          <input
            type="text"
            name="description"
            id="description"
            placeholder="description"
          />
        </fieldset>
        <button type="submit">Create Account</button>
      </Form>
    </div>
  );
}
export const action = async ({ request, params }: ActionArgs) => {
  const form = await request.formData();
  const data = Object.fromEntries(form.entries());
  await createAccount(params.book!, data as Account);

  return redirect(`/book/${params.book}/account/add`);
};
export const loader = async ({ request, params }: LoaderArgs) => {
  const accounts = await getAccounts(params.book!);
  return { accounts };
};
