import type { loader as periodLoader } from "../$period";
import { Link, useMatches } from "@remix-run/react";
import { useMemo } from "react";
import {
  buildAccountTree,
  calculateAccountBalance,
} from "~/core/ledger/account";
import { getTransactionEntry } from "~/core/ledger/transaction";
import type { AccountTree } from "~/core/ledger/types";

export default function AccountPage() {
  const matches = useMatches();
  const data = useMemo(() => {
    const period = matches.find((f) => f.id == "routes/book/$book/$period");
    return period?.data as Awaited<ReturnType<typeof periodLoader>>;
  }, [matches]);

  const accounts = useMemo(() => {
    const trxs = getTransactionEntry(data.transactions);
    const accounts = calculateAccountBalance(data.accounts, trxs);
    return buildAccountTree(accounts);
  }, [data]);

  return (
    <div className="px-8">
      <div className="flex items-center justify-between py-2">
        <h1 className="font-semibold text-gray-800">Accounts Balance</h1>
        <Link
          to="./../../account/add"
          className="px-3 py-1 bg-teal-500 rounded text-white"
        >
          Add Account
        </Link>
      </div>
      <div id="table-accounts" className="py-2">
        <div className="table w-full">
          <div className="table-header-group">
            <div className="table-row">
              <div className="table-cell w-full">Account</div>
              <div className="table-cell">Balance</div>
            </div>
          </div>
          <div className="table-row-group">
            {accounts.map((acc) => (
              <AccountRow account={acc} key={acc.id} />
              // <div key={acc.id} className="table-row">
              //   <div className="table-cell py-2 border-b">
              //     <Link to={`./${acc.id}`}>{acc.name}</Link>
              //   </div>
              //   <div className="table-cell text-end border-b">
              //     {acc.balance.toLocaleString()}
              //   </div>
              // </div>
            ))}
          </div>
        </div>
      </div>
      {/* <code>{JSON.stringify(accountBalance)}</code> */}
    </div>
  );
}

interface AccountRowProps {
  account: AccountTree;
  depth?: number;
}

function AccountRow({ account, depth = 0 }: AccountRowProps) {
  return (
    <>
      <div className="table-row">
        <div className="table-cell py-2 border-b">
          <Link
            style={{
              marginLeft: `${depth * 20}px`,
            }}
            to={`./${account.id}`}
          >
            {account.name}
          </Link>
        </div>
        <div className="table-cell text-end border-b">
          {account.balance.toLocaleString()}
        </div>
      </div>
      {account.subAccounts?.map((subAcc) => (
        <AccountRow
          key={`${account.id}-sub-${subAcc.id}`}
          depth={depth + 1}
          account={subAcc}
        />
      ))}
    </>
  );
}
