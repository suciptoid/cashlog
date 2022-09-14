import type { loader } from "../$period";
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

export function useBookData() {
  const matches = useMatches();
  const data = useMemo(() => {
    const period = matches.find((f) => f.id == "routes/book/$book/$period");
    return period?.data as Awaited<ReturnType<typeof loader>>;
  }, [matches]);

  return data;
}
