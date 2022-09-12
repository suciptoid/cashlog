import Calendar from "./Calendar";
import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "~/hooks/useOutsideClick";
import dayjs from "~/lib/dayjs";
import type { DateRange } from "~/lib/types";

interface Props {
  since?: Date;
  until?: Date;
  onChange?: (date: DateRange) => void;
}

export default function DatePicker({ since, until, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [start, setStart] = useState<Date>(since || new Date());
  const [end, setEnd] = useState<Date>(until || new Date());
  const calendarRef = useRef(null);

  useOnClickOutside(calendarRef, () => setPickerOpen(false));

  useEffect(() => {
    if (since instanceof Date) {
      setStart(since);
    } else {
      setStart(dayjs().set("date", 1).toDate());
    }

    if (until instanceof Date) {
      setEnd(until);
    } else {
      setEnd(new Date());
    }
  }, [since, until]);

  const handleChange = (range: DateRange) => {
    setStart(range.since);
    setEnd(range.until);

    if (onChange) {
      onChange(range);
    }
  };

  return (
    <div className="relative flex flex-shrink-0 items-center">
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="date-select flex flex-shrink-0 cursor-pointer items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-slate-100 active:bg-slate-200"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>
          {start && dayjs(start).format("DD MMM YYYY")} -{" "}
          {end && dayjs(end).format("DD MMM YYYY")}
        </span>
        <ChevronDownIcon className="ml-3 h-4 w-4" />
      </button>
      {pickerOpen && (
        <div ref={calendarRef} className="absolute top-0 right-0 z-10">
          <Calendar since={start} until={end} onRangeChanged={handleChange} />
        </div>
      )}
    </div>
  );
}
