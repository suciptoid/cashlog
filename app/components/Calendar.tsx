import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import dayjs from "~/lib/dayjs";
import type { DateRange } from "~/lib/types";

interface Props {
  since?: Date;
  until?: Date;
  single?: boolean;
  onRangeChanged?: (range: DateRange) => void;
  onDateChanged?: (date: Date) => void;
}

export default function Calendar({
  since,
  until,
  onRangeChanged,
  single,
  onDateChanged,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(since || new Date());
  const [start, setStart] = useState<Date | null>(since || new Date());
  const [end, setEnd] = useState<Date | null>(
    until || (single ? null : new Date())
  );

  const handleClickDate = (date: Date) => {
    const range: DateRange = { since: new Date(), until: new Date() };

    if (!single) {
      if (start && end) {
        setEnd(null);
        setStart(date);
      } else if (start && !end) {
        // Set End Date
        if (dayjs(date).diff(start, "day") < 0) {
          range.since = date;
          range.until = start;

          setEnd(start);
          setStart(date);
        } else {
          setEnd(date);
          range.since = start;
          range.until = date;
        }

        // Trigger Callback
        if (onRangeChanged) {
          onRangeChanged(range);
        }
      }
    } else {
      if (onDateChanged) {
        setStart(date);
        setEnd(null);
        onDateChanged(date);
      }
    }
  };

  const generateCalendar = () => {
    // Generate day of current month
    const days = [];

    // Get first day of current month
    const firstDay = dayjs(currentMonth).startOf("month").toDate();
    const firstWeek = dayjs(firstDay).startOf("week").toDate();

    for (let x = 0; x < 42; x++) {
      const day = dayjs(firstWeek).add(x, "day").toDate();
      days.push({
        date: day,
        thisMonth: dayjs(firstDay).isSame(day, "month"),
        isStart: start && dayjs(start).isSame(day, "day"),
        isEnd: end && dayjs(end).isSame(day, "day"),
        isBetween:
          start &&
          end &&
          dayjs(day).diff(start, "day") >= 0 &&
          dayjs(day).diff(end, "day") < 0 &&
          !dayjs(day).isSame(end, "day"),
        isFuture: dayjs(day).isAfter(dayjs()),
        isToday: dayjs(day).isToday(),
      });
    }

    return days.map((day, key) => (
      <button
        type="button"
        key={key}
        onClick={() => handleClickDate(day.date)}
        tabIndex={0}
        className={`mb-1 cursor-pointer text-center
          ${day.thisMonth ? "font-medium text-gray-900" : "text-gray-500"} 
          ${day.isStart && end ? "rounded-l-full bg-green-100" : ""} 
          ${day.isEnd ? "rounded-r-full bg-green-100" : ""} 
          ${day.isBetween ? "rounded-none bg-green-100" : ""}
          ${dayjs(day.date).day() === 0 ? "rounded-l-full" : ""}
          ${dayjs(day.date).day() === 6 ? "rounded-r-full" : ""}
        `}
      >
        <div
          className={`h-full w-full rounded-full p-2 
          ${day.isStart ? "rounded-l-full bg-green-200 font-semibold" : ""} 
          ${day.isEnd ? "rounded-r-full bg-green-200 font-semibold" : ""} 
          ${!day.isFuture ? "hover:bg-green-200" : "cursor-not-allowedx"}
        `}
        >
          {day.date.getDate()}
        </div>
      </button>
    ));
  };

  const navigateMonth = (direction: number = 1) => {
    const newMonth = dayjs(currentMonth).add(direction, "month").toDate(); // addMonths(currentMonth, direction);
    setCurrentMonth(newMonth);
  };
  return (
    <div className="date-picker mt-10 w-[250px] rounded-md border bg-white px-2 py-3 shadow-sm">
      <div className="month-navigator flex items-center">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="rounded-full p-2 hover:bg-slate-100 active:bg-slate-200"
        >
          <ChevronLeftIcon className="h-4 w-4 text-gray-800" />
        </button>
        <div className="text-md flex-grow text-center font-semibold">
          {dayjs(currentMonth).format("MMMM YYYY")}
        </div>
        <button
          type="button"
          onClick={() => navigateMonth()}
          className="rounded-full p-2 hover:bg-slate-100 active:bg-slate-200"
        >
          <ChevronRightIcon className="h-4 w-4 text-gray-800" />
        </button>
      </div>
      <div className="calendar-grid">
        <div className="grid select-none grid-cols-7 text-xs">
          {/* Week Header */}
          <div className="py-2 text-center font-bold">S</div>
          <div className="py-2 text-center font-bold">M</div>
          <div className="py-2 text-center font-bold">T</div>
          <div className="py-2 text-center font-bold">W</div>
          <div className="py-2 text-center font-bold">T</div>
          <div className="py-2 text-center font-bold">F</div>
          <div className="py-2 text-center font-bold">S</div>
          {/* Week Date */}
          {generateCalendar()}
        </div>
      </div>
    </div>
  );
}
