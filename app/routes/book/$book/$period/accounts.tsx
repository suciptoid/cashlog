import { useBookData } from "../$period";
import { Link } from "@remix-run/react";
import { useMemo } from "react";
import type { AccountTree } from "~/core/ledger/account";
import { Account } from "~/core/ledger/account";

export default function AccountPage() {
  const { accounts } = useBookData();

  const tree = useMemo(() => {
    return Account.toTree(accounts);
  }, [accounts]);

  return (
    <div className="px-8">
      <div className="flex items-center justify-between py-2">
        <h1 className="font-semibold text-gray-800">Accounts Balance</h1>
        <Link to="./add" className="px-3 py-1 bg-teal-500 rounded text-white">
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
            {tree.map((acc) => (
              <AccountRow account={acc} key={acc.id} />
            ))}
          </div>
        </div>
      </div>
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
      {account.childrens.map((child) => (
        <AccountRow
          key={`${account.id}-sub-${child.id}`}
          depth={depth + 1}
          account={child}
        />
      ))}
    </>
  );
}
