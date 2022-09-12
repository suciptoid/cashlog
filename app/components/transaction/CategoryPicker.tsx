import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { useFetcher } from "@remix-run/react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryEntity } from "~/models/category";

interface Props {
  options?: CategoryEntity[];
  selectedId?: string;
  placeholder?: string;
  fieldName?: string;
  filter?: (category: CategoryEntity) => boolean;
  onChange?: (id: string) => void;
}

export default function CategoryPicker(props: Props) {
  const { selectedId, placeholder, fieldName, onChange } = props;
  const [selected, setSelected] = useState<CategoryEntity | undefined>();

  const fetcher = useFetcher<CategoryEntity[]>();

  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load(`/dashboard/category`);
    }
  }, [fetcher]);

  const options = useMemo(() => {
    const data = fetcher.data || [];
    if (typeof props.filter === "function") {
      return data.filter(props.filter);
    }
    return data;
  }, [fetcher.data, props.filter]);
  useEffect(() => {
    if (selectedId) {
      const acc = options.find((c) => c.id === selectedId);
      if (acc) {
        setSelected(acc);
      }
    }
  }, [options, selectedId]);

  const onSelect = useCallback(
    (cat: CategoryEntity) => {
      setSelected(cat);

      onChange?.(cat.id);
    },
    [onChange]
  );

  return (
    <div className="rounded-lg">
      <input
        type="hidden"
        name={fieldName || "category_id"}
        value={selected?.id || ""}
      />
      <Listbox value={selected} onChange={onSelect}>
        <div className="relative mt-1">
          <Listbox.Button className="relative cursor-pointer py-2 px-3 w-full border overflow-hidden rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            {selected ? (
              <div className="justify-between flex pr-5">
                <span className="block truncate font-medium">
                  {selected.name}
                </span>
                <span className="block truncate text-slate-700">
                  {selected.spending ? "Spending" : "Income"}
                </span>
              </div>
            ) : (
              <span className="text-slate-500">
                {placeholder || "Select Category"}
              </span>
            )}
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
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
              {options.map((cat) => (
                <Listbox.Option
                  key={cat.id}
                  className={({ active }) =>
                    `relative select-none py-2 px-4 mx-1 rounded-md cursor-pointer text-sm  ${
                      active ? "bg-slate-200 text-slate-800" : "text-gray-900"
                    }`
                  }
                  value={cat}
                >
                  {({ selected, active }) => (
                    <div
                      className={`flex justify-between ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span
                        className={`${
                          cat.spending ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {cat.spending ? "Spending" : "Income"}
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
