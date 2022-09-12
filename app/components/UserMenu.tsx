import {
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useCallback, useRef, useState } from "react";
import { useOnClickOutside } from "~/hooks/useOutsideClick";
import type { DashboardLoaderData } from "~/routes/dashboard";

export default function UserMenu() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const ref = useRef(null);
  const fetcher = useFetcher();

  const onLogout = useCallback(() => {
    fetcher.submit(null, {
      method: "delete",
      action: "/dashboard/user",
    });
  }, [fetcher]);

  const { user } = useLoaderData<DashboardLoaderData>();

  useOnClickOutside(ref, () => setShowUserMenu(false));

  return (
    <div id="user-menu" className="relative w-full" ref={ref}>
      {user && (
        <button
          onClick={() => setShowUserMenu(true)}
          className="flex w-full cursor-pointer items-center rounded-md px-3 py-2 hover:bg-slate-100"
        >
          <div className="mr-2 flex items-center rounded-full">
            <img
              alt="profile"
              className="mr-2 rounded-full"
              width={30}
              height={30}
              src={user.picture}
            />
          </div>
          <span>{user.name}</span>
        </button>
      )}

      {showUserMenu && (
        <div className="absolute bottom-14 left-0 z-20 mt-1 flex w-[260px] flex-col rounded border bg-white py-2 text-gray-600 shadow-md">
          <div className="user-name group flex cursor-pointer items-center px-3 py-2 hover:bg-slate-100">
            <UserIcon className="mr-4 ml-2 h-4 w-4 text-gray-600 group-hover:text-gray-900" />
            <div>
              <div className="">{user?.name}</div>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="my-1 h-1 border-b" />
          <button
            onClick={onLogout}
            className="group my-1 flex w-full items-center px-3 py-2 text-left hover:bg-slate-100"
          >
            <ArrowRightOnRectangleIcon className="mr-4 ml-2 h-4 w-4 text-gray-600 group-hover:text-gray-900" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
