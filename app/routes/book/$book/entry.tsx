import { useBookData } from "../$book";
import { CalendarIcon } from "@heroicons/react/24/outline";
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import qs from "qs";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { z } from "zod";
import Calendar from "~/components/Calendar";
import { PageHeader } from "~/components/PageHeader";
import type { JournalEntry } from "~/core/ledger";
import { Book } from "~/core/ledger/book";
import dayjs from "~/lib/dayjs";

const formatDay = (date: Date) => {
  if (!dayjs(date).isToday() && !dayjs(date).isYesterday()) {
    return dayjs(date).format("DD MMMM YYYY");
  } else if (dayjs(date).isToday()) {
    return "Today";
  } else if (dayjs(date).isYesterday()) {
    return "Yesterday";
  }
};

export default function EntryPage() {
  const { accounts } = useBookData();
  const [dateOpen, setDateOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const dateReff = useRef(null);
  const onChangeTime = (e: ChangeEvent<HTMLInputElement>) => {
    const changed = dayjs(date)
      .set("hour", Number(e.target.value.split(":")[0]))
      .set("minute", Number(e.target.value.split(":")[1]))
      .toDate();

    setDate(changed);
  };

  const [entries, setEntries] = useState<Partial<JournalEntry>[]>([
    {
      account: "",
      amount: 0,
    },
    {
      account: "",
      amount: 0,
    },
  ]);

  const updateEntries = (index: number, data: Partial<JournalEntry>) => {
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
        <div className="flex gap-2">
          {/* Description */}
          <fieldset className="py-2 flex flex-col flex-1">
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
          {/* Date */}
          <fieldset className="flex items-center flex-1">
            <input type="hidden" name="date" value={date.getTime()} />
            {/* Date */}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-500">
                Transaction Date
              </div>
              <div className="relative flex rounded-md border">
                <button
                  type="button"
                  onClick={() => setDateOpen(true)}
                  className="flex flex-grow cursor-pointer items-center rounded-md px-3 py-2 text-sm active:bg-slate-100"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-800" />
                  {formatDay(date)}
                </button>
                {dateOpen && (
                  <div ref={dateReff} className="absolute top-0 left-0 z-10">
                    <Calendar
                      single
                      since={date}
                      onDateChanged={(date) => {
                        setDate(date);
                        setDateOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Time */}
            <div className="ml-2">
              <div className=" text-sm font-medium text-gray-500">Time</div>
              <div className="rounded-md border px-3 py-2 text-sm">
                <input
                  type="time"
                  onChange={onChangeTime}
                  value={dayjs(date).format("HH:mm")}
                />
              </div>
            </div>
          </fieldset>
        </div>
        {entries.map((m, idx) => (
          <fieldset
            key={idx}
            className="px-3 py-2 border my-1 flex items-center"
          >
            <select
              name={`entries[${idx}][account]`}
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
              name={`entries[${idx}][description]`}
              className="flex-1"
              placeholder="Memo"
              defaultValue={m.description}
              onChange={(e) =>
                updateEntries(idx, { description: e.target.value })
              }
            />
            <input
              type="number"
              defaultValue={m.amount}
              onChange={(e) =>
                updateEntries(idx, { amount: Number(e.target.value) })
              }
              name={`entries[${idx}][amount]`}
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
            className="bg-green-500 text-white px-3 py-2 rounded"
          >
            Create Entry
          </button>
        </fieldset>
      </Form>
    </div>
  );
}

// export const loader = async ({ request, params }: LoaderArgs) => {
//   const accounts = await getAccounts(params.book!);
//   return { accounts };
// };

const EntryDTO = z.object({
  description: z.string().optional(),
  date: z
    .string()
    .transform((v) => parseInt(v))
    .default(Date.now().toString()),
  entries: z
    .array(
      z.object({
        amount: z
          .string()
          .transform((v) => Number(v))
          .default("0"),
        description: z.string().optional(),
        account: z.string().min(10),
      })
    )
    .min(2),
});

export const action = async ({ request, params }: ActionArgs) => {
  const plainData = await request.text();
  const data = EntryDTO.parse(qs.parse(plainData));

  const book = await Book.withId(params.book!).createJournal(data);
  console.log("book", book);
  const referer = request.headers.get("Referer");
  const search = new URL(request.url);
  console.log("search param", search.searchParams.get("redirect"), search);
  return redirect(search.searchParams.get("redirect") || referer || "/book");
};
