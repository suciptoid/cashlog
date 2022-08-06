import { Combobox, Transition } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { Currency } from "~/lib/currency";
import { currencies } from "~/lib/currency";

const options = currencies.map((c) => ({
  code: c.code,
  symbol: c.symbol,
  name: c.name,
}));

interface Props {
  selectedCode?: string;
}

export default function CurrencyPicker({ selectedCode }: Props) {
  const [selected, setSelected] = useState(options[0]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (selectedCode) {
      const currency = options.find((c) => c.code === selectedCode);
      if (currency) {
        setSelected(currency);
      }
    }
  }, [selectedCode]);

  const filtered = useMemo(() => {
    if (query === "") return options;

    return options.filter(
      (currency) =>
        currency.code
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.toLowerCase().replace(/\s+/g, "")) ||
        currency.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.toLowerCase().replace(/\s+/g, ""))
    );
  }, [query]);

  const display = (currency: Currency) => currency.code;

  return (
    <div className="rounded-lg">
      <input type="hidden" name="currency" value={selected.code} />
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <div className="relative w-full border cursor-default overflow-hidden rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 rounded-lg"
              displayValue={display}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <SelectorIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filtered.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filtered.map((currency) => (
                  <Combobox.Option
                    key={currency.code}
                    className={({ active }) =>
                      `relative select-none py-2 px-4 mx-1 rounded-md cursor-pointer text-sm  ${
                        active ? "bg-slate-200 text-slate-800" : "text-gray-900"
                      }`
                    }
                    value={currency}
                  >
                    {({ selected, active }) => (
                      <div
                        className={`flex justify-between ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        <span className="truncate">{currency.name}</span>
                        <span className="text-slate-600">{currency.code}</span>
                      </div>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
