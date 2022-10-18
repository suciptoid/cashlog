import { useState } from "react";

// @ts-ignore
const timezones: string[] = Intl.supportedValuesOf("timeZone");

export default function TimezonePicker() {
  const [selected] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  return (
    <select
      className="timezone-picker border rounded-md my-1 py-2 px-3 outline-none focus:ring focus:ring-teal-100"
      defaultValue={selected}
      name="timezone"
    >
      {timezones.map((t, i) => (
        <option value={t} key={i}>
          {t.replace(/_/gi, " ")}
        </option>
      ))}
    </select>
  );
}
