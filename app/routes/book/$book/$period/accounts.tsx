import type { loader as periodLoader } from "../$period";
import { Link, useMatches } from "@remix-run/react";
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
      <h1 className="px-3 py-2 font-semibold text-gray-800">
        Accounts Balance
      </h1>
      <div id="table-accounts" className="px-3 py-2">
        <div className="table w-full">
          <div className="table-header-group">
            <div className="table-row">
              <div className="table-cell w-full">Account</div>
              <div className="table-cell">Balance</div>
            </div>
          </div>
          <div className="table-row-group">
            {accountBalance.map((acc) => (
              <div key={acc.id} className="table-row">
                <div className="table-cell py-2 border-b">
                  <Link to={`./${acc.id}`}>{acc.name}</Link>
                </div>
                <div className="table-cell text-end border-b">
                  {acc.balance.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <code>{JSON.stringify(accountBalance)}</code> */}
    </div>
  );
}
