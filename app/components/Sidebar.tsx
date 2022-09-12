import { NavLink } from "./NavLink";
import UserMenu from "./UserMenu";
import {
  ChartPieIcon,
  CreditCardIcon,
  FolderOpenIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { UserSession } from "~/lib/cookies";

export default function Sidebar({ user }: { user: UserSession }) {
  const ref = useRef<HTMLDivElement>(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setShowSidebar(false);
  }, [pathname]);

  return (
    <aside
      id="sidebar"
      ref={ref}
      className="w-full flex-col  justify-start overscroll-contain bg-slate-50 md:flex md:w-[250px] md:flex-shrink-0 md:border-r"
    >
      {/* Product Logo */}
      <div
        id="name"
        className="m-auto flex h-[55px] w-full items-center justify-between border-b px-4 text-xl font-bold md:border-b-0 md:px-6"
      >
        <Link
          prefetch="intent"
          to="/dashboard"
          className="flex items-center text-lg font-bold text-gray-800"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="scroll"
            className="mr-2 h-7 w-7 text-teal-500"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
          >
            <path
              fill="currentColor"
              d="M48 0C21.53 0 0 21.53 0 48v64c0 8.84 7.16 16 16 16h80V48C96 21.53 74.47 0 48 0zm208 412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74 13.41 128 29.92 128 48v368c0 38.87 34.65 69.65 74.75 63.12C234.22 474 256 444.46 256 412.57zM288 384v32c0 52.93-43.06 96-96 96h336c61.86 0 112-50.14 112-112 0-8.84-7.16-16-16-16H288z"
            />
          </svg>
          Cashlog
        </Link>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </button>
      </div>

      <div
        className={`z-10 w-full flex-grow flex-col border-b bg-slate-50 shadow-sm md:z-auto md:shadow-none ${
          showSidebar
            ? "top-15 absolute flex flex-col md:relative md:top-0"
            : "hidden md:flex"
        }`}
      >
        {/* Navigation Links */}
        <div
          id="side-nav-link"
          className="w-full flex-grow flex-col items-center justify-end px-2 py-3 text-sm font-medium"
        >
          <h2 className="w-full px-2 py-2 text-xs font-semibold uppercase text-gray-500">
            Cashflow
          </h2>
          <NavLink
            to="/dashboard/transaction"
            active={pathname === "/dashboard/transaction"}
          >
            <QueueListIcon className="mr-2 h-4 w-4" />
            Transactions
          </NavLink>

          <NavLink
            to="/dashboard/account"
            active={pathname === "/dashboard/account"}
          >
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Accounts
          </NavLink>

          <NavLink
            active={pathname === "/dashboard/category"}
            to="/dashboard/category"
          >
            <FolderOpenIcon className="mr-2 h-4 w-4" />
            Category
          </NavLink>
          <NavLink
            active={pathname === "/dashboard/budget"}
            to="/dashboard/budget"
          >
            <ChartPieIcon className="mr-2 h-4 w-4" />
            Budget
          </NavLink>
          {/* <h2 className="w-full px-2 py-2 text-xs font-semibold uppercase text-gray-500">
            Accounting
          </h2>
          <NavLink to="/book" active={pathname === "/book"}>
            <BookOpenIcon className="mr-2 h-4 w-4" />
            Book
          </NavLink> */}
          <div className="flex-grow" />
        </div>
        <div className="w-full border-t px-3 py-2">
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
