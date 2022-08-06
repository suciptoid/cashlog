import { Dialog, Transition } from "@headlessui/react";
import {
  CalendarIcon,
  ChevronDoubleDownIcon,
  XIcon,
} from "@heroicons/react/outline";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useNavigate, useTransition } from "@remix-run/react";
import dayjs from "dayjs";
import { Fragment, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Calendar from "~/components/Calendar";
import AccountPicker from "~/components/transaction/AccountPicker";
import { useOnClickOutside } from "~/hooks/useOutsideClick";
import { requireUser } from "~/lib/cookies";
import { FieldValue, firestore } from "~/lib/firebase.server";
import { accountCollection } from "~/models/account";
import { transactionCollection } from "~/models/transaction";

export const action: ActionFunction = async ({ request }) => {
  // Create transfer
  const user = await requireUser(request);
  const form = await request.formData();
  const data = Object.fromEntries(form);

  // Get Accounts
  const accountQuery = await accountCollection(user.user_id)
    .where("id", "in", [data.account_from, data.account_to])
    .get();

  const accounts = accountQuery.docs.map((doc) => doc.data());

  const fromAcc = accounts.find((account) => account.id == data.account_from);
  const toAcc = accounts.find((account) => account.id == data.account_to);
  const transferId = accountCollection(user.user_id).doc().id;

  if (!fromAcc || !toAcc) {
    return json({ error: "Could not find account" }, { status: 400 });
  }

  const fromDate = dayjs(parseInt(data.time.toString()) || Date.now());
  const toDate = dayjs(fromDate).add(10, "ms");

  await firestore.runTransaction(async (t) => {
    const accCollection = accountCollection(user.user_id);
    const amount = Math.abs(parseInt(data.amount.toString()) || 0);

    // Update account balance
    t.update(accCollection.doc(fromAcc.id), {
      balance: FieldValue.increment(-amount),
    });
    t.update(accCollection.doc(toAcc.id), {
      balance: FieldValue.increment(amount),
    });

    // Update transaction
    const from = transactionCollection(user.user_id).doc();
    const to = transactionCollection(user.user_id).doc();
    t.create(from, {
      id: from.id,
      user_id: user.user_id,
      amount: -amount,
      category_id: "system-transfer-out",
      account_id: fromAcc.id,
      description: `Transfer to ${toAcc?.name || data.account_to}`,
      time: fromDate.valueOf(),
      transfer_id: transferId,
      created_at: Date.now(),
      updated_at: Date.now(),
      excluded: data.excluded == "true",
    });
    t.create(to, {
      id: to.id,
      user_id: user.user_id,
      amount: amount,
      category_id: "system-transfer-in",
      account_id: toAcc.id,
      description: `Transfer from ${fromAcc?.name || data.account_from}`,
      time: toDate.valueOf(),
      transfer_id: transferId,
      created_at: Date.now(),
      updated_at: Date.now(),
      excluded: data.excluded == "true",
    });
  });

  return json(data);
};

const formatDay = (date: Date) => {
  if (!dayjs(date).isToday() && !dayjs(date).isYesterday()) {
    return dayjs(date).format("DD MMMM YYYY");
  } else if (dayjs(date).isToday()) {
    return "Today";
  } else if (dayjs(date).isYesterday()) {
    return "Yesterday";
  }
};

export default function TransferPage() {
  const transition = useTransition();
  const [dateOpen, setDateOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const dateReff = useRef(null);
  const navigate = useNavigate();

  useOnClickOutside(dateReff, () => setDateOpen(false));
  const onChangeTime = (e: ChangeEvent<HTMLInputElement>) => {
    const changed = dayjs(date)
      .set("hour", Number(e.target.value.split(":")[0]))
      .set("minute", Number(e.target.value.split(":")[1]))
      .toDate();

    setDate(changed);
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center md:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between text-lg font-medium leading-6 text-gray-900"
                >
                  <h3>Transfer</h3>
                  <button
                    onClick={() => {
                      navigate(-1);
                    }}
                  >
                    <XIcon className="h-6 w-6 rounded text-gray-400 " />
                  </button>
                </Dialog.Title>

                <Form method="post" id="transfer-form">
                  <fieldset>
                    <label
                      htmlFor="amount"
                      className="text-sm font-medium text-slate-600"
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      min={0}
                      placeholder="Transaction Amount"
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </fieldset>

                  <fieldset className="inline-flex py-2 px-1 text-sm">
                    <input
                      value="true"
                      type="checkbox"
                      name="excluded"
                      className="mt-1"
                      id="excluded"
                      defaultChecked={true}
                    />
                    <label htmlFor="excluded" className="ml-2 text-gray-500">
                      Exclude from total
                    </label>
                  </fieldset>

                  {/* Date & Time */}
                  <fieldset className="flex items-center">
                    <input type="hidden" name="time" value={date.getTime()} />
                    {/* Date */}
                    <div className="flex-1">
                      <div className="mt-3 text-sm font-medium">
                        Transaction Date
                      </div>
                      <div className="relative flex rounded-md border">
                        <button
                          type="button"
                          onClick={() => setDateOpen(true)}
                          className="flex flex-grow cursor-pointer items-center rounded-md px-3 py-1 active:bg-slate-100"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-800" />
                          {formatDay(date)}
                        </button>
                        {dateOpen && (
                          <div
                            ref={dateReff}
                            className="absolute top-0 left-0 z-10"
                          >
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
                      <div className="mt-3 text-sm font-medium">Time</div>
                      <div className="rounded-md border px-3 py-1">
                        <input
                          type="time"
                          onChange={onChangeTime}
                          value={dayjs(date).format("HH:mm")}
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Account Select */}
                  <div className="flex w-full flex-col">
                    {/* First Account */}
                    <div className="account-select flex-1">
                      <div className="mt-3 flex items-end justify-between py-1">
                        <div className="text-sm font-medium">
                          Source Account
                        </div>
                      </div>
                      <AccountPicker inputName="account_from" options={[]} />
                    </div>
                    <div className="flex justify-end pr-8">
                      <div className="relative">
                        <div className="absolute left-[12px] h-12 w-0.5 bg-gray-200"></div>
                        <div className="absolute mt-2 rounded-full border bg-white p-1">
                          <ChevronDoubleDownIcon className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>

                    {/* Second Account */}
                    <div className="account-select flex-1">
                      <div className="mt-3 flex items-end justify-between py-1">
                        <div className="text-sm font-medium">
                          Target Account
                        </div>
                      </div>
                      <AccountPicker inputName="account_to" options={[]} />
                    </div>
                  </div>
                  <fieldset className="flex flex-col-reverse items-center justify-end pt-4 md:flex-row">
                    <button
                      type="submit"
                      value="submit"
                      disabled={transition.state !== "idle"}
                      className="w-full rounded-md bg-teal-400 px-3 py-2 text-sm font-medium text-white active:bg-green-600 disabled:bg-slate-300 sm:w-auto"
                    >
                      Create Transfer
                    </button>
                  </fieldset>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
