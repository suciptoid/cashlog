import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { day } from "~/lib/dayjs";

export const loader = async ({ request, params }: LoaderArgs) => {
  const period = params.period;

  // Set current period
  if (!period) {
    throw redirect(
      `/book/${params.book}/${day().startOf("month").valueOf()}/accounts`
    );
  }
  return null;
};
