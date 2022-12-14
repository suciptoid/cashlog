import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import type { UserSession } from "~/lib/cookies";
import { requireUser } from "~/lib/cookies";

export type DashboardLoaderData = {
  user: Awaited<UserSession>;
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  if (user) {
    return { user };
  }
  throw redirect("/auth");
};

export default function DashboardIndex() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main className="relative flex h-screen w-screen flex-col md:flex-row">
      <Sidebar user={user} />

      <div
        id="dashboard-page"
        className="sticky flex h-screen flex-grow flex-col overflow-y-auto"
      >
        <Outlet />
      </div>
    </main>
  );
}
