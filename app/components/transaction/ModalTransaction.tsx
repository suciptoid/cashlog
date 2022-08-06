import Calendar from "../Calendar";
import AccountPicker from "./AccountPicker";
import CategoryPicker from "./CategoryPicker";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronDoubleRightIcon, XIcon } from "@heroicons/react/outline";
import { CalendarIcon } from "@heroicons/react/solid";
import { Form, useTransition } from "@remix-run/react";
import type { ChangeEvent } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "~/hooks/useOutsideClick";
import dayjs from "~/lib/dayjs";
import type { TransactionEntity } from "~/models/transaction";

interface Props {
  transaction?: TransactionEntity;
  onClose: () => void;
}

const formatDay = (date: Date) => {
  if (!dayjs(date).isToday() && !dayjs(date).isYesterday()) {
    return dayjs(date).format("DD MMMM YYYY");
  } else if (dayjs(date).isToday()) {
    return "Today";
  } else if (dayjs(date).isYesterday()) {
    return "Yesterday";
  }
};

export default function ModalTransaction({ onClose, transaction }: Props) {
  const [isTransfer, setIsTransfer] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const dateReff = useRef(null);
  const transition = useTransition();

  useEffect(() => {
    if (transaction) {
      setDate(new Date(transaction.time));
    }
  }, [transaction]);

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
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
          <div className="flex min-h-full items-center justify-center md:p-4 text-center">
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
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between"
                >
                  <h3>
                    {transaction ? "Edit Transaction" : "Add Transaction"}
                  </h3>
                  <button onClick={onClose}>
                    <XIcon className="w-6 h-6 text-gray-400 rounded " />
                  </button>
                </Dialog.Title>

                <Form
                  id="form-transaction"
                  method={transaction ? "patch" : "post"}
                  className="mt-2"
                >
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
                      className="w-full rounded-lg border px-3 py-2 mt-1 text-sm"
                      defaultValue={Math.abs(transaction?.amount || 0)}
                    />
                  </fieldset>

                  <fieldset className="py-2 px-1 text-sm inline-flex">
                    <input
                      value="true"
                      type="checkbox"
                      name="excluded"
                      className="mt-1"
                      id="excluded"
                      defaultChecked={transaction?.excluded}
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
                  <div className="flex flex-col w-full">
                    {/* First Account */}
                    <div className="account-select flex-1">
                      <div className="mt-3 flex items-end justify-between py-1">
                        <div className="text-sm font-medium">
                          {isTransfer && "Source "}Account
                        </div>
                        {false && !isTransfer && !transaction && (
                          <button
                            type="button"
                            onClick={() => setIsTransfer(true)}
                            className="text-sm font-medium text-blue-600"
                          >
                            Make Internal Transfer
                          </button>
                        )}
                      </div>
                      <AccountPicker
                        selectedId={transaction?.account_id}
                        options={[]}
                      />
                    </div>

                    {isTransfer && (
                      <>
                        <div className="p-2">
                          <ChevronDoubleRightIcon className="h-5 w-5 text-gray-600" />
                        </div>

                        {/* Second Account */}
                        <div className="account-select flex-1">
                          <div className="mt-3 flex items-end justify-between py-1">
                            <div className="text-sm font-medium">
                              {isTransfer && "Target "}Account
                            </div>
                            <button
                              onClick={() => setIsTransfer(false)}
                              className="text-sm font-medium text-blue-600"
                            >
                              Cancel Transfer
                            </button>
                          </div>
                          <AccountPicker options={[]} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Category Select */}
                  {!isTransfer && (
                    <>
                      <div className="mt-3 text-sm font-medium">Category</div>
                      <CategoryPicker
                        selectedId={transaction?.category_id}
                        options={[]}
                      />
                    </>
                  )}

                  {/* Description */}
                  {!isTransfer && (
                    <>
                      <div className="mt-3 text-sm font-medium">
                        Description
                      </div>
                      <div className="flex rounded-md border">
                        <input
                          type="text"
                          name="description"
                          placeholder="Description"
                          className="flex-grow rounded-md px-3 py-1"
                          defaultValue={transaction?.description}
                        />
                      </div>
                    </>
                  )}
                </Form>
                <fieldset className="flex flex-col-reverse items-center justify-end pt-4 md:flex-row">
                  {transaction && (
                    <Form method="delete" className="w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={transition.state !== "idle"}
                        className="mt-2 w-full rounded-md px-3 py-2 text-sm border border-red-400 md:border-transparent font-medium text-red-400 disabled:text-gray-400 hover:bg-red-400 hover:text-white sm:mr-2 sm:mt-0 sm:w-auto"
                      >
                        Delete Transaction
                      </button>
                    </Form>
                  )}
                  <button
                    form="form-transaction"
                    type="submit"
                    value="submit"
                    disabled={transition.state !== "idle"}
                    className="w-full rounded-md bg-teal-400 px-3 py-2 text-sm font-medium text-white active:bg-green-600 disabled:bg-slate-300 sm:w-auto"
                  >
                    {transaction ? "Update Transaction" : "Create Transaction"}
                  </button>
                </fieldset>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
