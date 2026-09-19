import { makeId } from "./id";

const DAY_CODES = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function unfold(text) {
  // RFC5545 line folding: continuation lines start with a space or tab.
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function parseDateTime(value) {
  // value like 20250115T090000Z, 20250115T090000, or 20250115 (all-day)
  const isAllDay = /^\d{8}$/.test(value);
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!match) return null;
  const [, y, mo, d, h = "0", mi = "0", s = "0", z] = match;
  let date;
  if (z) {
    date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  } else {
    // Naive local time — TZID (if present in params) is not resolved, treated as local wall-clock time.
    date = new Date(+y, +mo - 1, +d, +h, +mi, +s);
  }
  return { date, isAllDay };
}

function parseRRule(value) {
  const parts = Object.fromEntries(value.split(";").map((p) => p.split("=")));
  const freq = parts.FREQ;
  if (freq !== "WEEKLY" && freq !== "DAILY") return null; // unsupported recurrence kinds are skipped (treated as one-off)

  let daysOfWeek;
  if (freq === "DAILY") {
    daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
  } else if (parts.BYDAY) {
    daysOfWeek = parts.BYDAY.split(",")
      .map((code) => DAY_CODES[code])
      .filter((d) => d !== undefined);
  }
  if (!daysOfWeek || daysOfWeek.length === 0) return null;

  let until = null;
  if (parts.UNTIL) {
    const parsed = parseDateTime(parts.UNTIL);
    if (parsed) {
      const d = parsed.date;
      until = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
  }

  return { daysOfWeek, until };
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toMinutes(date) {
  return date.getHours() * 60 + date.getMinutes();
}

// Parses ICS/iCalendar text into a flat array of planner events (source: 'outlook', locked: true).
// Supports: SUMMARY, DTSTART/DTEND (UTC 'Z', or naive local; all-day dates), simple weekly/daily RRULE
// with BYDAY/UNTIL, and LOCATION appended to notes. Timezone IDs (TZID) other than UTC are treated as
// local wall-clock time — a deliberate simplification since resolving arbitrary IANA/Windows zone names
// client-side isn't practical without a large timezone database. RDATE/EXDATE and non-weekly/daily
// recurrence rules are not supported; such events import as their first occurrence only.
export function parseIcsToEvents(icsText) {
  const text = unfold(icsText);
  const blocks = text.split("BEGIN:VEVENT").slice(1);
  const events = [];

  for (const block of blocks) {
    const body = block.split("END:VEVENT")[0];
    const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);

    let summary = "Untitled";
    let location = "";
    let dtstart = null;
    let dtend = null;
    let rrule = null;

    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const keyPart = line.slice(0, colonIdx);
      const value = line.slice(colonIdx + 1);
      const [key] = keyPart.split(";");

      if (key === "SUMMARY") summary = value.replace(/\\,/g, ",").replace(/\\n/gi, " ");
      else if (key === "LOCATION") location = value.replace(/\\,/g, ",");
      else if (key === "DTSTART") dtstart = parseDateTime(value);
      else if (key === "DTEND") dtend = parseDateTime(value);
      else if (key === "RRULE") rrule = parseRRule(value);
    }

    if (!dtstart) continue;

    const startDate = dtstart.date;
    const durationMinutes = dtend
      ? Math.max(15, Math.round((dtend.date - startDate) / 60000))
      : dtstart.isAllDay
        ? 24 * 60
        : 60;

    const recurrence = rrule ? { daysOfWeek: rrule.daysOfWeek, until: rrule.until } : null;

    events.push({
      id: makeId(),
      title: summary,
      categoryId: "cat-outlook",
      type: "outlook",
      subjectId: null,
      date: toDateStr(startDate),
      startMinutes: dtstart.isAllDay ? 0 : toMinutes(startDate),
      durationMinutes,
      recurrence,
      exceptions: {},
      status: "confirmed",
      notes: location,
      source: "outlook",
      locked: true,
    });
  }

  return events;
}
