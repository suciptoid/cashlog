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
        <Link to="./add" className="px-3 py-1 bg-green-500 rounded text-white">
          Add Account
        </Link>
      </div>
      <div id="table-accounts" className="py-2 text-sm">
        <div className="table w-full">
          <div className="table-header-group text-gray-900">
            <div className="table-row">
              <div className="table-cell border-y font-semibold py-2">
                Account
              </div>
              <div className="table-cell border-y font-semibold py-2">
                Description
              </div>
              <div className="table-cell border-y text-right font-semibold py-2">
                Balance
              </div>
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
      <div className="table-row hover:bg-gray-50">
        <div className="table-cell py-2 border-b font-medium text-gray-700 hover:text-blue-600">
          <Link
            style={{
              marginLeft: `${depth * 20}px`,
            }}
            to={`./${account.id}`}
          >
            {account.name}
          </Link>
        </div>
        <div className="table-cell border-b">
          {account.description || "n/a"}
        </div>
        <div className="table-cell text-end border-b font-medium">
          {account.balance.toLocaleString()}{" "}
          <span className="text-gray-600">{account.currency}</span>
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
