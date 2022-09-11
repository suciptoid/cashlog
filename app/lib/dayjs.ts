import dayjs from "dayjs";
import customParse from "dayjs/plugin/customParseFormat";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Plugins
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParse);

export default dayjs;
export { dayjs };
