import { useMemo } from "react";
import type { TransactionItem } from "~/models/transaction";

type Props = {
  title: string;
  transactions: TransactionItem[];
};
export default function TransactionOverview({ transactions, title }: Props) {
  const all = useMemo(() => {
    return {
      income: transactions
        .filter((t) => t.amount > 0 && !t.excluded)
        .reduce((acc, t) => acc + t.amount, 0),
      expense: transactions
        .filter((t) => t.amount < 0 && !t.excluded)
        .reduce((acc, t) => acc + t.amount, 0),
    };
  }, [transactions]);
  return (
    <div className="px-3 py-2 border rounded text-sm">
      <h2 className="font-medium py-1">{title}</h2>
      <div className="table w-full">
        <div className="table-row">
          <div className="table-cell w-1/2 ">Income</div>
          <div className="table-cell text-right w-1/2">
            {all.income.toLocaleString()}
          </div>
        </div>
        <div className="table-row">
          <div className="table-cell w-1/2 ">Spending</div>
          <div className="table-cell text-right w-1/2 pb-2">
            {all.expense.toLocaleString()}
          </div>
        </div>
        <div className="table-row font-medium">
          <div className="table-cell w-1/2 pt-2 mt-1 border-t">Total</div>
          <div className="table-cell text-right w-1/2 border-t">
            {Number(all.income + all.expense).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
