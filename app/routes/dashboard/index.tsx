import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  return redirect("/dashboard/transaction");
};

export default function DashboardIndex() {
  return <div id="dashboard">dashboard here</div>;
}
