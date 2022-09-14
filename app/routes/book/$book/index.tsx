import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import dayjs from "~/lib/dayjs";

export const loader = async ({ request, params }: LoaderArgs) => {
  const period = params.period;

  // Set current period
  if (!period) {
    const currentMonth = dayjs();
    console.log(
      "redirect to curent period",
      period,
      currentMonth.format("YYYY-MM")
    );
    throw redirect(
      `/book/${params.book}/${currentMonth.format("YYYY-MM")}/accounts`
    );
  }
  return null;
};
