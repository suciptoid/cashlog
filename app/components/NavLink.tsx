import { Link } from "@remix-run/react";
import React from "react";

interface Props {
  active?: boolean;
  to: string;
  children?: React.ReactNode;
}

export const NavLink = ({ active, to, children }: Props) => (
  <Link
    to={to}
    prefetch="intent"
    className={`mb-1 flex w-full items-center rounded-lg px-4 py-3  hover:bg-slate-200 hover:text-gray-600 ${
      active ? "bg-slate-200 text-gray-600" : "text-gray-500"
    }`}
  >
    {children}
  </Link>
);
