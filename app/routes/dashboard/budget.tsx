import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import type { Dayjs } from "dayjs";
import { useCallback, useState } from "react";
import DatePicker from "~/components/DatePicker";
import { PageHeader } from "~/components/PageHeader";
import { requireUser } from "~/lib/cookies";
import dayjs from "~/lib/dayjs";
import { firestore } from "~/lib/firebase.server";
import type { DateRange } from "~/lib/types";
import type { BudgetWithCategory } from "~/models/budget";
import { budgetCollection } from "~/models/budget";
import { categoryCollection } from "~/models/category";

const getWidth = (budget: BudgetWithCategory): number => {
  const value = (Math.abs(budget.used) / Math.abs(budget.amount)) * 100;
  if (isNaN(value)) {
    return 0;
  }
  return Math.min(100, value);
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const urlQuery = url.searchParams;

  const dayInstance: Dayjs = dayjs().tz("Asia/Jakarta");

  let start: number = urlQuery.has("start")
    ? parseInt(urlQuery.get("start")!.toString())
    : dayInstance.startOf("month").valueOf();
  let end: number = urlQuery.has("end")
    ? parseInt(urlQuery.get("end")!.toString())
    : dayInstance.endOf("month").valueOf();

  const range = {
    since: start,
    until: end,
  };

  const query = budgetCollection(user.user_id)
    .where("start", ">=", start)
    .where("start", "<=", end);
  const budgets = await query.get();

  if (budgets.empty) {
    return json({ budgets: [], range });
  }

  const results = budgets.docs.map((b) => b.data()).filter((f) => f.end <= end);
  const categories = results
    .map((m) => m.category_id)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((id) => categoryCollection(user?.user_id).doc(id));

  if (results.length === 0 || categories.length === 0) {
    return json({
      budgets: [],
      range,
    });
  }
  const refResult = await firestore.getAll(...categories);

  const data = results.map((m) => {
    const category = refResult.find(
      (r) => r.ref.path === `users/${user.user_id}/categories/${m.category_id}`
    );
    return {
      ...m,
      category: category?.data(),
    } as BudgetWithCategory;
  });

  return {
    budgets: data,
    range,
  };
};

interface LoaderData {
  budgets: BudgetWithCategory[];
  range?: {
    since: number;
    until: number;
  };
}

export default function BudgetIndex() {
  const { budgets, range: defaultRange } = useLoaderData<LoaderData>();
  const [range, setRange] = useState<DateRange>({
    since: defaultRange?.since
      ? new Date(defaultRange.since)
      : dayjs().startOf("month").toDate(),
    until: defaultRange?.until
      ? new Date(defaultRange.until)
      : dayjs().endOf("month").toDate(),
  });

  const [, setSearchParams] = useSearchParams();
  const onRangeChanged = useCallback(
    (range: DateRange) => {
      setRange(range);
      const searchParams = new URLSearchParams();
      searchParams.set("start", range.since.getTime().toString());
      searchParams.set(
        "end",
        dayjs(range.until).endOf("day").valueOf().toString()
      );
      setSearchParams(searchParams);
    },
    [setSearchParams]
  );
  return (
    <div id="budget-page">
      {/* Header */}

      <PageHeader>
        <div className="flex h-full items-center px-6">
          <h2 className="text-xl font-bold text-gray-800">Budget</h2>
          <div className="flex-grow"></div>
          <div id="transaction-filter" className="flex items-center py-2 px-2">
            <DatePicker
              onChange={onRangeChanged}
              since={range?.since}
              until={range?.until}
            />
          </div>
          <Link
            replace
            to="/dashboard/budget/create"
            id="add-category"
            className="ml-2 rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white"
          >
            Create Budget
          </Link>
        </div>
      </PageHeader>

      {/* Content */}
      <div id="budgets" className="md:px-8 px-4 py-4">
        {budgets && budgets.length > 0 && (
          <div className="w-full table text-sm">
            <div className="hidden md:table-header-group">
              <div className="table-row text-xs font-medium uppercase text-slate-700">
                <div className="table-cell border-b px-3 w-1/3 py-3">
                  Category
                </div>
                <div className="table-cell border-b px-3">Period</div>
                <div className="table-cell border-b px-3 w-1/4 text-right">
                  Amount
                </div>
              </div>
            </div>
            <div className="table-row-group">
              {budgets?.map((budget) => (
                <Link
                  to={budget.id}
                  key={budget.id}
                  className="mb-3 grid cursor-pointer grid-cols-1 rounded-md border px-4 py-3 hover:bg-slate-50 md:table-row md:rounded-none md:border-0"
                >
                  <div className="mb-2 font-bold text-slate-800 md:table-cell md:border-b md:py-2 md:px-3 md:font-medium">
                    {budget.category?.name}
                  </div>
                  <div className=" text-sm text-slate-500 md:table-cell md:border-b md:px-3 md:text-left md:text-sm">
                    {dayjs(budget.start).format("DD MMM YYYY")} -{" "}
                    {dayjs(budget.end).format("DD MMM YYYY")}
                  </div>
                  <div className="md:text-right font-medium md:table-cell md:border-b md:px-3">
                    <div>
                      <div className="my-1 text-xs font-medium">
                        {budget.used
                          ? budget.used.toLocaleString() + " / "
                          : ""}
                        {budget.amount.toLocaleString()}
                      </div>
                      <div className=" h-2 w-full rounded-full bg-orange-200">
                        {/* progress */}
                        <div
                          className="relative h-full rounded-full bg-orange-500"
                          style={{ width: `${getWidth(budget)}%` }}
                        >
                          <div className="tooltips absolute right-[-15px] top-[-30px] hidden rounded-md bg-black px-2 py-1 text-xs font-semibold text-white shadow group-hover:flex">{`${getWidth(
                            budget
                          ).toFixed(0)}%`}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {budgets?.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            You don&apos;t have active budgets on this period.
          </div>
        )}
      </div>
      <Outlet />
    </div>
  );
}
