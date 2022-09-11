import type { loader as periodLoader } from "../$period";
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { calculateAccountBalance } from "~/core/ledger/account";
import { getTransactionEntry } from "~/core/ledger/transaction";

export default function AccountPage() {
  const matches = useMatches();
  const data = useMemo(() => {
    const period = matches.find((f) => f.id == "routes/book/$book/$period");
    return period?.data as Awaited<ReturnType<typeof periodLoader>>;
  }, [matches]);

  const accountBalance = useMemo(() => {
    const trxs = getTransactionEntry(data.transactions);
    const accounts = calculateAccountBalance(data.accounts, trxs);
    return accounts;
  }, [data]);

  return (
    <div>
      <h1>Accounts Balance</h1>
      <code>{JSON.stringify(accountBalance)}</code>
    </div>
  );
}
