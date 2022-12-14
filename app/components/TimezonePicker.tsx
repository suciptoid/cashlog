import { useEffect, useState } from "react";
import timezones from "~/lib/timezones";

export default function TimezonePicker() {
  const [selected, setSelected] = useState<string | undefined>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  console.log("default selected", selected);

  useEffect(() => {
    setSelected(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

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
