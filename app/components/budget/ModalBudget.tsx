import DatePicker from "../DatePicker";
import CategoryPicker from "../transaction/CategoryPicker";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { Form, useTransition } from "@remix-run/react";
import { Fragment, useState } from "react";
import dayjs from "~/lib/dayjs";
import type { DateRange } from "~/lib/types";
import type { BudgetEntity } from "~/models/budget";

interface Props {
  budget?: Partial<BudgetEntity>;
  onClose: () => void;
  onDelete?: () => void;
}

export function ModalBudget({ onClose, onDelete, budget }: Props) {
  const transition = useTransition();
  const [range, setRange] = useState<DateRange>({
    since: budget?.start
      ? new Date(budget.start)
      : dayjs().startOf("month").toDate(),
    until: budget?.end ? new Date(budget.end) : dayjs().endOf("month").toDate(),
  });

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
                  <h3>{budget ? "Budget Detail" : "Create Budget"}</h3>
                  <button onClick={onClose}>
                    <XIcon className="w-6 h-6 text-gray-400 rounded " />
                  </button>
                </Dialog.Title>

                <Form method={budget ? "patch" : "post"} id="form-budget">
                  <fieldset>
                    <div className="mt-3 text-sm font-medium">Category</div>
                    <CategoryPicker
                      selectedId={budget?.category_id}
                      options={[]}
                    />
                  </fieldset>

                  <fieldset className="my-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-600">
                        Budget Amount
                      </div>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Budget Amount"
                        min={0}
                        defaultValue={budget?.amount}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600">
                        Period
                      </div>
                      <input
                        type="hidden"
                        name="start"
                        value={range.since.getTime()}
                      />
                      <input
                        type="hidden"
                        name="end"
                        value={range.until.getTime()}
                      />
                      <DatePicker
                        since={range.since}
                        until={range.until}
                        onChange={(update) => setRange(update)}
                      />
                    </div>
                  </fieldset>
                </Form>
                <div className="flex flex-col-reverse items-center justify-end pt-4 md:flex-row">
                  {budget && (
                    <Form method="delete" className="w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={transition.state !== "idle"}
                        className="mt-2 w-full rounded-md px-3 py-2 text-sm border border-red-400 md:border-transparent font-medium text-red-400 disabled:text-gray-400 hover:bg-red-400 hover:text-white sm:mr-2 sm:mt-0 sm:w-auto"
                      >
                        Delete Budget
                      </button>
                    </Form>
                  )}
                  <button
                    form="form-budget"
                    type="submit"
                    value="submit"
                    disabled={transition.state !== "idle"}
                    className="w-full rounded-md bg-teal-400 px-3 py-2 text-sm font-medium text-white active:bg-green-600 disabled:bg-slate-300 sm:w-auto"
                  >
                    {budget ? "Update Budget" : "Create Budget"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
