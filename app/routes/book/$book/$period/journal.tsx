import { useBookData } from "../$period";
import dayjs from "dayjs";
import { Fragment } from "react";

export default function JournalPage() {
  const { journals } = useBookData();
  return (
    <div className="px-3 py-2">
      <h1 className="font-semibold py-2">General Journal</h1>

      <div id="table-accounts" className="py-2">
        <div className="table w-full">
          <div className="table-header-group">
            <div className="table-row">
              <div className="table-cell">Date</div>
              <div className="table-cell">Account</div>
              <div className="table-cell">Description</div>
              <div className="table-cell">Debit</div>
              <div className="table-cell">Credit</div>
            </div>
          </div>
          <div className="table-row-group">
            {journals.map((journal) => (
              <Fragment key={journal.id}>
                <div className="table-row">
                  <div className="table-cell">
                    {dayjs(journal.date).format("DD/MM/YYYY")}
                  </div>
                  <div className="table-cell"></div>
                  <div className="table-cell">{journal.description}</div>
                  <div className="table-cell col-span-2 "></div>
                </div>
                {journal.entries.map((entry) => (
                  <div key={entry.id} className="table-row">
                    <div className="table-cell">
                      {/* {dayjs(journal.date).format("DD/MM/YYYY")} */}
                    </div>
                    <div className="table-cell">{entry.account}</div>
                    <div className="table-cell">{entry.description}</div>
                    <div className="table-cell">
                      {entry.amount.toLocaleString()}
                    </div>
                    <div className="table-cell">
                      {entry.amount.toLocaleString()}
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
