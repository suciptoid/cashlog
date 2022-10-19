import { useBookData } from "../$book";
import dayjs from "dayjs";
import { Fragment, useMemo } from "react";

export default function JournalPage() {
  const { journals, accounts } = useBookData();

  const lists = useMemo(() => {
    return journals.map((j) => {
      const entries = j.entries.map((e) => {
        const acc = accounts.find((f) => f.id == e.account);
        return {
          ...e,
          account_name: acc?.name,
        };
      });

      return {
        ...j,
        entries,
      };
    });
  }, [journals, accounts]);
  return (
    <div className="px-3 py-2">
      <h1 className="font-semibold py-2">General Journal</h1>

      <div id="table-accounts" className="py-2">
        <div className="table w-full">
          <div className="table-header-group py-3 text-sm font-semibold text-gray-800">
            <div className="table-row">
              <div className="table-cell py-3 px-2">Date</div>
              <div className="table-cell px-2">Description</div>
              <div className="table-cell px-2">Account</div>
              <div className="table-cell text-end px-2 py-1">Debit</div>
              <div className="table-cell text-end px-2 py-1">Credit</div>
            </div>
          </div>
          <div className="table-row-group">
            {lists.map((journal) => (
              <Fragment key={journal.id}>
                <div className="table-row text-sm bg-gray-50">
                  <div className="table-cell border-t border-b border-l pt-2 px-2 py-1 font-semibold text-gray-700">
                    {dayjs(journal.date).format("DD/MM/YYYY")}
                  </div>
                  <div className="table-cell border-t border-l px-2 py-1">
                    {journal.description}
                  </div>
                  <div className="table-cell border-t"></div>
                  <div className="table-cell border-t"></div>
                  <div className="table-cell border-t border-r"></div>
                </div>
                {journal.entries.map((entry) => (
                  <div key={entry.id} className="table-row text-sm">
                    <div className="table-cell border-l">
                      {/* {dayjs(journal.date).format("DD/MM/YYYY")} */}
                    </div>
                    <div className="table-cell px-2 py-1 border">
                      {entry.description}
                    </div>
                    <div className="table-cell border px-2 py-1 font-semibold">
                      {entry.account_name}
                    </div>
                    <div className="table-cell text-end border px-2 py-1 font-semibold text-gray-800">
                      {entry.amount > 0 ? entry.amount.toLocaleString() : ""}
                    </div>
                    <div className="table-cell text-end border px-2 py-1 font-semibold text-gray-800">
                      {entry.amount < 0
                        ? Math.abs(entry.amount).toLocaleString()
                        : ""}
                    </div>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
