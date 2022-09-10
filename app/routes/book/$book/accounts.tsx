import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAccounts } from "~/core/ledger/account";

export default function AccountsPage() {
  const { accounts } = useLoaderData<typeof loader>();
  return (
    <div id="account-page">
      <h1>Accounts</h1>
      <div id="account-lists">
        {accounts.map((acc) => (
          <div key={acc.id}> {acc.name}</div>
        ))}
      </div>
    </div>
  );
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const accounts = await getAccounts(params.book!);
  return { accounts };
};
