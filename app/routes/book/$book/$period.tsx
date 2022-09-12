import type { LoaderArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { PageHeader } from "~/components/PageHeader";
import { getAccounts } from "~/core/ledger/account";
import { getTransaction } from "~/core/ledger/transaction";
import dayjs from "~/lib/dayjs";

export default function RangePage() {
  const { period } = useLoaderData<typeof loader>();
  const location = useLocation();
  return (
    <>
      <PageHeader>
        <div className="flex items-center h-full px-3">
          <h1 className=" font-bold text-gray-800">
            {dayjs(period).format("YYYY MMMM")}
          </h1>
          <div className="flex-1"></div>
          <Link
            to={`./../entry?redirect=${location.pathname}`}
            className="bg-teal-500 text-white rounded px-3 py-2 text-sm"
          >
            New Entry
          </Link>
        </div>
      </PageHeader>
      <Outlet />
    </>
  );
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const period = dayjs(params.period, "YYYY-MM");
  const book = params.book!;
  const range = {
    start: period.startOf("month").valueOf(),
    end: period.endOf("month").valueOf(),
  };
  const transactions = await getTransaction(book, range.start, range.end);
  const accounts = await getAccounts(book);

  // console.log(range, transactions);

  return {
    range,
    transactions,
    period,
    accounts,
  };
};
