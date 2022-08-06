import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { Form, useTransition } from "@remix-run/react";
import { Fragment } from "react";
import CurrencyPicker from "~/components/CurrencyPicker";
import type { AccountEntity } from "~/models/account";

interface Props {
  account?: AccountEntity;
  onClose: () => void;
  onDelete?: () => void;
}

export function ModalAccount({ onClose, onDelete, account }: Props) {
  const transition = useTransition();
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
                  <h3>{account ? "Account Detail" : "Create Account"}</h3>
                  <button onClick={onClose}>
                    <XIcon className="w-6 h-6 text-gray-400 rounded " />
                  </button>
                </Dialog.Title>
                <div className="mt-2">
                  {!account && (
                    <p className="text-sm py-2 text-gray-500">
                      You can add your Bank Account or your Wallet to track your
                      daily transaction
                    </p>
                  )}
                </div>
                <Form
                  method={account ? "patch" : "post"}
                  id="create-account-form"
                >
                  <div className="flex">
                    {/* Currency */}
                    <div className="mr-2 flex-grow">
                      <h3 className="my-1 text-sm font-medium">Account Name</h3>
                      <input
                        type="text"
                        name="name"
                        placeholder="Account name"
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        defaultValue={account?.name}
                      />
                    </div>
                    {/* Currency */}
                    <div className="w-1/2">
                      <h3 className="my-1 text-sm font-medium">Currency</h3>
                      <CurrencyPicker selectedCode={account?.currency} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="my-1 text-sm font-medium">
                      Account Number{" "}
                      <span className="text-xs text-gray-400">(optional)</span>
                    </h3>
                    <input
                      type="text"
                      name="account_number"
                      placeholder="0123xxxxxx"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      defaultValue={account?.account_number}
                    />
                  </div>
                  {!account && (
                    <div className="mt-2">
                      <h3 className="my-1 text-sm font-medium">
                        Initial Balance{" "}
                      </h3>
                      <input
                        type="number"
                        name="balance"
                        placeholder="0123xxxxxx"
                        className="w-full rounded-lg border px-3 py-2 text-sm ring-teal-400 outline-none focus:ring-1"
                      />
                    </div>
                  )}
                  <div className="flex flex-col-reverse items-center justify-end pt-4 md:flex-row">
                    {account && (
                      <button
                        type="button"
                        onClick={onDelete}
                        disabled={transition.state !== "idle"}
                        className="mt-2 w-full rounded-md px-3 py-2 text-sm font-medium text-red-400 disabled:text-gray-400 hover:bg-red-400 hover:text-white sm:mr-2 sm:mt-0 sm:w-auto"
                      >
                        Delete Account
                      </button>
                    )}
                    <button
                      type="submit"
                      value="submit"
                      disabled={transition.state !== "idle"}
                      className="w-full rounded-md bg-teal-400 px-3 py-2 text-sm font-medium text-white active:bg-green-600 disabled:bg-slate-300 sm:w-auto"
                    >
                      {account ? "Update Account" : "Create Account"}
                    </button>
                  </div>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
