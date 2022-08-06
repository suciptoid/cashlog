import { Listbox, Transition } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";
import { useFetcher } from "@remix-run/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { AccountEntity } from "~/models/account";

interface Props {
  options: AccountEntity[];
  selectedId?: string;
  inputName?: string;
}

export default function AccountPicker({ selectedId, inputName }: Props) {
  const [selected, setSelected] = useState<AccountEntity | undefined>();

  const fetcher = useFetcher<AccountEntity[]>();

  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load(`/dashboard/account`);
    }
  }, [fetcher]);

  const options = useMemo(() => fetcher.data || [], [fetcher.data]);
  useEffect(() => {
    if (selectedId) {
      const acc = options.find((c) => c.id === selectedId);
      if (acc) {
        setSelected(acc);
      }
    }
  }, [options, selectedId]);

  return (
    <div className="rounded-lg">
      <input
        type="hidden"
        name={inputName || "account_id"}
        value={selected?.id || ""}
      />
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <Listbox.Button className="relative cursor-pointer py-2 px-3 w-full border overflow-hidden rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            {selected ? (
              <div className="justify-between flex pr-5">
                <span className="block truncate font-medium">
                  {selected.name}
                </span>
                <span className="block truncate text-slate-700">
                  {selected.currency} {selected.balance.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-slate-500">Select an account</span>
            )}
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <SelectorIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((account) => (
                <Listbox.Option
                  key={account.id}
                  className={({ active }) =>
                    `relative select-none py-2 px-4 mx-1 rounded-md cursor-pointer text-sm  ${
                      active ? "bg-slate-200 text-slate-800" : "text-gray-900"
                    }`
                  }
                  value={account}
                >
                  {({ selected, active }) => (
                    <div
                      className={`flex justify-between ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      <span className="truncate">{account.name}</span>
                      <span className="text-slate-600">
                        {account.balance?.toLocaleString()} {account.currency}
                      </span>
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
