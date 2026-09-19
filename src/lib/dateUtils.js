// All "date strings" are local YYYY-MM-DD. All "day" Date objects are local midnight.
// daysOfWeek values use native JS getDay(): 0=Sun, 1=Mon, ... 6=Sat.

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayStr() {
  return formatDate(new Date());
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addDaysToStr(str, n) {
  return formatDate(addDays(parseDate(str), n));
}

export function isSameDay(a, b) {
  return formatDate(a) === formatDate(b);
}

export function startOfWeek(date, weekStartsOn = 1) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDates(anchorDate, weekStartsOn = 1) {
  const start = startOfWeek(anchorDate, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function daysBetween(dateStrA, dateStrB) {
  const a = parseDate(dateStrA);
  const b = parseDate(dateStrB);
  return Math.round((b - a) / 86400000);
}

export function timeStrToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTimeStr(mins) {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}`;
}

export function minutesToLabel(mins) {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const h24 = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const ampm = h24 < 12 ? "AM" : "PM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${pad2(m)} ${ampm}`;
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_LABELS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatDayHeader(date) {
  return `${WEEKDAY_LABELS[date.getDay()]} ${date.getDate()}`;
}

export function formatMonthYear(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
