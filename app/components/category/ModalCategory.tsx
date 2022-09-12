import CategoryPicker from "../transaction/CategoryPicker";
import { Dialog, Switch, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Form, useMatches, useTransition } from "@remix-run/react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryEntity } from "~/models/category";

interface Props {
  category?: CategoryEntity;
  onClose: () => void;
  onDelete?: () => void;
}

export default function Modalcategory({ onClose, category, onDelete }: Props) {
  const [isSpending, setIsSpending] = useState(category?.spending || false);
  const [parentId, setParentId] = useState(category?.parent_id);
  const transition = useTransition();

  const matches = useMatches();
  const categories = useMemo<CategoryEntity[]>(() => {
    const categoryRoute = matches.find(
      (f) => f.id === "routes/dashboard/category"
    );
    if (categoryRoute) {
      return categoryRoute.data as CategoryEntity[];
    }
    return [];
  }, [matches]);

  useEffect(() => {
    if (parentId) {
      const parent = categories.find((c) => c.id === parentId);
      if (parent) {
        setIsSpending(parent.spending);
      }
    }
  }, [categories, parentId]);

  const onChangeSpending = useCallback(
    (spending: boolean) => {
      if (parentId) {
        return false;
      }
      setIsSpending(spending);
    },
    [parentId]
  );

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between"
                >
                  <h3>{category ? "Edit Category" : "Add Category"}</h3>
                  <button onClick={onClose}>
                    <XMarkIcon className="w-6 h-6 text-gray-400 rounded " />
                  </button>
                </Dialog.Title>
                <Form
                  method={category ? "patch" : "post"}
                  className="mt-2"
                  id="create-account-form"
                >
                  <fieldset>
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-slate-600"
                    >
                      Category Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Category Name"
                      className="w-full rounded-lg border px-3 py-2 mt-1 text-sm"
                      defaultValue={category?.name}
                    />
                  </fieldset>
                  <fieldset className="mt-2 flex-col flex">
                    <div className="text-sm font-medium text-slate-600 mb-1">
                      Parent Category
                    </div>
                    <CategoryPicker
                      onChange={(id) => setParentId(id)}
                      fieldName="parent_id"
                      selectedId={parentId}
                      filter={
                        category?.id ? (c) => c.id !== category.id : undefined
                      }
                      placeholder="Select parent category"
                    />
                  </fieldset>
                  <fieldset className="mt-2 flex-col flex">
                    <div className="text-sm font-medium text-slate-600 mb-1">
                      Category Type
                    </div>
                    <div className="flex items-center">
                      {!isSpending ? (
                        <input type="hidden" value="false" name="spending" />
                      ) : null}
                      <Switch
                        name="spending"
                        checked={isSpending}
                        onChange={onChangeSpending}
                        defaultChecked={category?.spending}
                        value="true"
                        className={`
                        ${
                          isSpending ? "bg-teal-500" : "bg-slate-300"
                        } relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                      >
                        <span className="sr-only">Spending</span>
                        <span
                          aria-hidden="true"
                          className={`
                          ${
                            isSpending ? "translate-x-5" : "translate-x-0"
                          } pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                      <span className="text-sm ml-2">Spending</span>
                    </div>
                  </fieldset>
                  <fieldset className="flex flex-col-reverse items-center justify-end pt-4 md:flex-row">
                    {category && (
                      <button
                        type="button"
                        onClick={onDelete}
                        disabled={transition.state !== "idle"}
                        className="mt-2 w-full rounded-md px-3 py-2 text-sm border border-red-400 md:border-transparent font-medium text-red-400 disabled:text-gray-400 hover:bg-red-400 hover:text-white sm:mr-2 sm:mt-0 sm:w-auto"
                      >
                        Delete Category
                      </button>
                    )}
                    <button
                      type="submit"
                      value="submit"
                      disabled={transition.state !== "idle"}
                      className="w-full rounded-md bg-teal-400 px-3 py-2 text-sm font-medium text-white active:bg-green-600 disabled:bg-slate-300 sm:w-auto"
                    >
                      {category ? "Update Category" : "Create Category"}
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
