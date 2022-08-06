import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import type { Dayjs } from "dayjs";
import { useCallback, useState } from "react";
import DatePicker from "~/components/DatePicker";
import { PageHeader } from "~/components/PageHeader";
import TransactionOverview from "~/components/transaction/TransactionOverview";
import { requireUser } from "~/lib/cookies";
import { getCurrencySymbol } from "~/lib/currency";
import dayjs from "~/lib/dayjs";
import { firestore } from "~/lib/firebase.server";
import type { DateRange } from "~/lib/types";
import type { AccountEntity } from "~/models/account";
import { accountCollection } from "~/models/account";
import type { CategoryEntity } from "~/models/category";
import { categoryCollection } from "~/models/category";
import type { TransactionItem } from "~/models/transaction";
import { transactionCollection } from "~/models/transaction";

interface LoaderData {
  from: number;
  to: number;
  transactions: TransactionItem[];
  categories?: CategoryEntity[];
  accounts?: AccountEntity[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const url = new URL(request.url);

  const dayInstance: Dayjs = dayjs().tz("Asia/Jakarta");

  // Filter by transaction time
  const urlQuery = url.searchParams;
  const from = urlQuery.has("from")
    ? dayjs(parseInt(urlQuery.get("from")?.toString() || "0")).valueOf()
    : dayInstance.startOf("month").valueOf();
  const to = urlQuery.has("to")
    ? dayjs(parseInt(urlQuery.get("to")?.toString() || "0")).valueOf()
    : dayInstance.endOf("month").valueOf();

  let query = transactionCollection(user?.user_id)
    .where("time", ">=", from)
    .where("time", "<=", to);

  const data: LoaderData = {
    from,
    to,
    transactions: [],
  };

  // Filter by account
  if (url.searchParams.has("accounts")) {
    query = query.where("account_id", "==", url.searchParams.get("accounts"));
  }

  const transactions = await query.get();
  if (transactions.empty) {
    return json<LoaderData>(data);
  }

  const results = transactions.docs.map((doc) => doc.data());

  // Get categories and account
  const categoryRefs = results
    .map((m) => m.category_id)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((id) => categoryCollection(user?.user_id).doc(id));
  const accountRefs = results
    .map((m) => m.account_id)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((id) => accountCollection(user?.user_id).doc(id));

  const refResult = await firestore.getAll(...categoryRefs, ...accountRefs);

  const categories = refResult
    .filter((r) => r.exists && r.ref.path.includes("categories"))
    .map((r) => r.data() as CategoryEntity);
  const accounts = refResult
    .filter((r) => r.exists && r.ref.path.includes("accounts"))
    .map((r) => r.data() as AccountEntity);

  const trxWithCategoryAndAccount = results
    .sort((a, b) => b.time - a.time)
    .map((m) => {
      const category = categories.find((f) => f.id === m.category_id);
      const account = accounts.find((f) => f.id === m.account_id);
      return {
        ...m,
        category: category,
        account: account,
      } as TransactionItem;
    });

  return json<LoaderData>({
    ...data,
    transactions: trxWithCategoryAndAccount,
    categories,
    accounts,
  });
};

export const meta: MetaFunction = () => ({
  title: "Transactions - Cashlog",
  description: "View your transactions",
});

const formatAmount = (transaction: TransactionItem) => {
  return `${transaction?.amount! < 0 ? "-" : ""}${getCurrencySymbol(
    transaction.account?.currency
  )} ${Math.abs(transaction?.amount).toLocaleString()}`;
};

export default function Transaction() {
  const { transactions, from, to } = useLoaderData<LoaderData>();
  const [range, setRange] = useState<DateRange>({
    since: from ? dayjs(from).toDate() : dayjs().startOf("month").toDate(),
    until: to ? dayjs(to).toDate() : dayjs().endOf("month").toDate(),
  });

  const [, setSearchParams] = useSearchParams();
  const onRangeChanged = useCallback(
    (range: DateRange) => {
      setRange(range);
      const searchParams = new URLSearchParams();
      searchParams.set("from", range.since.getTime().toString());
      searchParams.set(
        "to",
        dayjs(range.until).endOf("day").valueOf().toString()
      );
      setSearchParams(searchParams);
    },
    [setSearchParams]
  );

  return (
    <div className="flex h-screen flex-col">
      <PageHeader>
        <div className="flex h-full items-center justify-center px-3 md:px-6">
          <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
          <div className="flex-grow"></div>
          <Form
            replace
            method="get"
            id="transaction-filter"
            className="hidden items-center py-2 px-2 lg:flex"
          >
            <input type="hidden" name="from" value={range.since.getTime()} />
            <input type="hidden" name="to" value={range.until.getTime()} />
            <div
              style={{ width: "200px" }}
              className="mr-2 rounded-md bg-slate-50 text-sm"
            >
              {/* <AccountSelect
                  value={account}
                  showAllAccounts={true}
                  onChange={(val) => setAccount(val)}
                >
                  {account ? null : "All Accounts"}
                </AccountSelect> */}
            </div>
            <div id="spacer" className="flex-grow" />
            <DatePicker
              since={range?.since}
              until={range?.until}
              onChange={onRangeChanged}
            />
          </Form>
          <Link
            to="create"
            prefetch="intent"
            id="add-category"
            className="ml-2 flex-shrink-0 rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-white"
          >
            Add Transaction
          </Link>
        </div>
      </PageHeader>
      <div
        id="dashboard"
        className="m-auto w-full flex-grow overflow-y-auto px-3 md:px-6"
      >
        <div className="overview grid grid-flow-col gap-2 py-3 overflow-x-auto">
          <TransactionOverview title="Total" transactions={transactions} />
        </div>
        <div className="my-4 table w-full table-auto rounded-md text-sm">
          <div className="hidden lg:table-header-group">
            <div className="table-row text-xs font-medium uppercase text-slate-700">
              <div className="table-cell border-b px-3">From</div>
              <div className="table-cell border-b px-3">To</div>
              <div className="table-cell border-b px-3 text-right">Amount</div>
              <div className="table-cell w-1/3 border-b px-3 py-3">
                Description
              </div>
              <div className="table-cell border-b px-3">Date</div>
            </div>
          </div>
          <div className="table-row-group">
            {transactions?.map((trx, key) => (
              <Link
                to={trx.id}
                key={key}
                className="mb-3 grid cursor-pointer grid-cols-2 rounded-md border px-4 py-3 hover:bg-slate-50 lg:table-row lg:rounded-none lg:border-0"
              >
                <div className="lg:table-cell lg:border-b lg:px-3">
                  {trx.category?.name}
                </div>
                <div className="lg:table-cell lg:border-b lg:px-3">
                  {trx.account?.name}
                </div>
                <div className="col-span-2 text-lg py-2 text-slate-500 lg:table-cell lg:border-b lg:px-3 lg:py-2 lg:text-left lg:text-sm">
                  <div
                    className={`font-bold md:text-right  lg:font-medium ${
                      trx.amount < 0 ? "text-rose-600" : "text-teal-600"
                    }`}
                  >
                    {formatAmount(trx)}
                  </div>
                </div>
                <div className="mb-2 col-span-2  text-slate-600 lg:table-cell lg:border-b lg:px-3 lg:py-2 ">
                  {trx.description}
                </div>
                <div className="lg:table-cell lg:border-b lg:px-3">
                  {dayjs(trx.time).isBefore(dayjs().add(-1, "day"))
                    ? dayjs(trx.time).format("DD MMM YYYY")
                    : dayjs(trx.time).fromNow()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
