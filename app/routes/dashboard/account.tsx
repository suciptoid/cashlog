import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/PageHeader";
import { requireUser } from "~/lib/cookies";
import { getCurrencySymbol } from "~/lib/currency";
import type { AccountEntity } from "~/models/account";
import { accountCollection } from "~/models/account";

type LoaderData = Awaited<AccountEntity[]>;

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const collection = accountCollection(user.user_id);

  const query = await collection.get();
  const accounts = query.docs
    .map((doc) => doc.data())
    .sort((a, b) => b.balance - a.balance);

  return json(accounts);
};

export const meta: MetaFunction = () => ({
  title: "Accounts - Cashlog",
});

export default function AccountPage() {
  const accounts = useLoaderData<LoaderData>();
  return (
    <div id="account">
      <div className="flex h-screen flex-col">
        <PageHeader>
          <div className="flex h-full items-center px-4 md:px-6">
            <h2 className="text-xl font-bold text-gray-800">Accounts</h2>
            <div className="flex-grow"></div>
            <div
              id="transaction-filter"
              className="flex items-center py-2 px-2"
            >
              <div id="spacer" className="flex-grow" />
            </div>
            <Link
              prefetch="intent"
              to="create"
              id="add-category"
              className="ml-2 rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white"
            >
              Add Account
            </Link>
          </div>
        </PageHeader>

        <div id="account" className="py-4 px-4 md:px-8">
          <div className="table w-full text-sm">
            <div className="hidden md:table-header-group">
              <div className="table-row text-xs font-medium uppercase text-slate-700">
                <div className="table-cell w-1/2 border-b px-3 py-3">Name</div>
                <div className="table-cell border-b px-3">Account Number</div>
                <div className="table-cell border-b px-3">Currency</div>
                <div className="table-cell border-b px-3 text-right">
                  Balance
                </div>
              </div>
            </div>
            <div className="table-row-group">
              {accounts?.map((account) => (
                <Link
                  to={`${account.id}`}
                  key={account.id}
                  className="mb-3 grid cursor-pointer grid-cols-2 rounded-md border px-4 py-3 hover:bg-slate-50 md:table-row md:rounded-none md:border-0"
                >
                  <div className="mb-2 font-bold text-slate-800 md:table-cell md:border-b md:py-2 md:px-3 md:font-medium">
                    {account.name}
                  </div>
                  <div className="text-right text-sm text-slate-500 md:table-cell md:border-b md:px-3 md:text-left md:text-sm">
                    {account.account_number || "-"}
                  </div>
                  <div className="md:table-cell md:border-b md:px-3">
                    {account.currency}
                  </div>
                  <div className="text-right font-medium md:table-cell md:border-b md:px-3">
                    {getCurrencySymbol(account.currency)}
                    {account.balance.toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
