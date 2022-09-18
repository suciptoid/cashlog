import { useBookData } from "../$period";
import { Link, useParams } from "@remix-run/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Journal } from "~/core/ledger/journal";

export default function AccountDetailPage() {
  const { accounts, journals } = useBookData();
  const params = useParams();

  const account = useMemo(() => {
    return accounts.find((f) => f.id == params.id);
  }, [accounts, params.id]);

  const transactions = useMemo(() => {
    const transactions = Journal.flatten(journals);
    return transactions.filter((f) => f.account == account?.id);
  }, [account?.id, journals]);

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
                  {dayjs(trx.date).format("YYYY-MM-DD")}
                </div>
                <div className="table-cell py-2 border-b">
                  <Link to={`./${trx.id}`}>
                    {trx.description || trx.journal_description}
                  </Link>
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
