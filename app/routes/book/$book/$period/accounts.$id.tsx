import type { loader as periodLoader } from "../$period";
import { Link, useMatches, useParams } from "@remix-run/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { getTransactionEntry } from "~/core/ledger/transaction";

export default function AccountDetailPage() {
  const matches = useMatches();
  const params = useParams();
  const data = useMemo(() => {
    const period = matches.find((f) => f.id == "routes/book/$book/$period");
    return period?.data as Awaited<ReturnType<typeof periodLoader>>;
  }, [matches]);

  const account = useMemo(() => {
    return data.accounts.find((f) => f.id == params.id);
  }, [data.accounts, params.id]);

  const transactions = useMemo(() => {
    const trxs = getTransactionEntry(data.transactions);
    return trxs.filter((f) => f.account_id == params.id);
  }, [data.transactions, params.id]);
  return (
    <div>
      <h1 className="px-3 py-2 font-semibold text-gray-800">{account?.name}</h1>
      <div id="table-account-transactions" className="px-3 py-2">
        <div className="table w-full table-auto">
          <div className="table-header-group">
            <div className="table-row">
              <div className="table-cell">Date</div>
              <div className="table-cell">Description</div>
              <div className="table-cell text-end">Amount</div>
            </div>
          </div>
          <div className="table-row-group">
            {transactions.map((trx) => (
              <div key={trx.id} className="table-row">
                <div className="table-cell border-b">
                  {dayjs(trx.datePosting).format("YYYY-MM-DD")}
                </div>
                <div className="table-cell py-2 border-b">
                  <Link to={`./${trx.id}`}>{trx.description}</Link>
                </div>
                <div className="table-cell text-end border-b">
                  {/* {JSON.stringify(trx)} */}
                  {trx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
