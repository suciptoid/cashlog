import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request, params }: LoaderArgs) => {
  const period = params.period;

  // Set current period
  if (!period) {
    throw redirect(`/book/${params.book}/accounts`);
  }
  return null;
};
