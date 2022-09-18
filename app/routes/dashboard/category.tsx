import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { PageHeader } from "~/components/PageHeader";
import { requireUser } from "~/lib/cookies";
import type { CategoryEntity } from "~/models/category";
import { categoryCollection } from "~/models/category";

type LoaderData = Awaited<CategoryEntity[]>;

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  const cat = categoryCollection(user?.user_id);

  const results = await cat.get();
  return json(results.docs.map((doc) => doc.data()));
};

export const meta: MetaFunction = () => ({
  title: "Categories - Cashlog",
});

interface CategoryWithChildern extends CategoryEntity {
  children?: CategoryWithChildern[];
}

export default function CategoryPage() {
  const data = useLoaderData<LoaderData>();

  const categories = useMemo(() => {
    const findChildren = (parentId: string): CategoryWithChildern[] => {
      const children = data
        .filter((f) => f.parent_id === parentId)
        .map(
          (f) =>
            ({ ...f, children: findChildren(f.id) } as CategoryWithChildern)
        );
      return children;
    };

    let base: CategoryWithChildern[] = data
      .filter((f) => f.parent_id === undefined || f.parent_id === "")
      .map((f) => ({ ...f, children: findChildren(f.id) }));

    return base;
  }, [data]);

  return (
    <div id="category" className="flex h-screen flex-col">
      <PageHeader>
        <div className="flex h-full items-center px-6">
          <h2 className="text-xl font-bold text-gray-800">Category</h2>
          <div className="flex-grow"></div>
          <div id="transaction-filter" className="flex items-center py-2 px-2">
            <div id="spacer" className="flex-grow" />
          </div>
          <Link
            to="create"
            replace
            className="ml-2 rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white"
          >
            Add Category
          </Link>
        </div>
      </PageHeader>

      <div id="category-list" className="px-4 md:px-8 py-4">
        <div className="table w-full text-sm">
          <div className="hidden md:table-header-group">
            <div className="table-row text-xs font-medium uppercase text-slate-700">
              <div className="table-cell w-1/2 border-b px-3 py-3">Name</div>
              <div className="table-cell border-b px-3">Category Type</div>
            </div>
          </div>
          <div className="table-row-group">
            {categories?.map((cat, key) => (
              <CategoryRow cat={cat} key={key} />
            ))}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function CategoryRow({
  cat,
  depth,
}: {
  cat: CategoryWithChildern;
  depth?: number;
}) {
  return (
    <>
      <Link
        to={cat.id}
        className="mb-3 grid cursor-pointer grid-cols-2 rounded-md border px-4 py-3 hover:bg-slate-50 md:table-row md:rounded-none md:border-0"
      >
        <div className="mb-2  font-bold text-slate-800 md:table-cell md:border-b md:py-2 md:px-3 md:font-medium">
          <div
            className="relative"
            style={{ marginLeft: depth ? `${depth * 1}rem` : undefined }}
          >
            {cat.name}
          </div>
        </div>
        <div className="text-right text-sm text-slate-500 md:table-cell md:border-b md:px-3 md:text-left md:text-sm">
          <span
            className={`${cat.spending ? "text-red-600" : "text-green-600"}`}
          >
            {cat.spending ? "Spending" : "Income"}
          </span>
        </div>
      </Link>
      {cat.children?.map((child, key) => (
        <CategoryRow depth={(depth || 0) + 1} cat={child} key={key} />
      ))}
    </>
  );
}
