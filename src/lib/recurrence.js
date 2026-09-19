import { addDays, formatDate, parseDate } from "./dateUtils";

// Expands an event into concrete occurrences that fall within [rangeStart, rangeEnd] (inclusive Date objects).
// Returns occurrences sorted by date/startMinutes.
export function getOccurrencesForRange(event, rangeStart, rangeEnd) {
  const occurrences = [];
  const exceptions = event.exceptions || {};

  const pushOccurrence = (anchorDateStr) => {
    const exception = exceptions[anchorDateStr];
    if (exception === "deleted") return;

    const overrides = exception && typeof exception === "object" ? exception : {};
    const date = overrides.date || anchorDateStr;
    const dateObj = parseDate(date);
    if (dateObj < rangeStart || dateObj > rangeEnd) return;

    occurrences.push({
      occurrenceId: `${event.id}::${anchorDateStr}`,
      eventId: event.id,
      anchorDate: anchorDateStr,
      date,
      startMinutes: overrides.startMinutes ?? event.startMinutes,
      durationMinutes: overrides.durationMinutes ?? event.durationMinutes,
      isMoved: !!(overrides.date || overrides.startMinutes !== undefined),
      event,
    });
  };

  if (!event.recurrence) {
    pushOccurrence(event.date);
  } else {
    const { daysOfWeek, until } = event.recurrence;
    const anchor = parseDate(event.date);
    const start = anchor > rangeStart ? anchor : rangeStart;
    const untilDate = until ? parseDate(until) : null;
    const end = untilDate && untilDate < rangeEnd ? untilDate : rangeEnd;

    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      if (d < anchor) continue;
      if (daysOfWeek.includes(d.getDay())) {
        pushOccurrence(formatDate(d));
      }
    }
    // Also check exceptions that moved an occurrence INTO this range from outside its normal date match
    for (const [anchorDateStr, ex] of Object.entries(exceptions)) {
      if (ex && typeof ex === "object" && ex.date) {
        const already = occurrences.some((o) => o.anchorDate === anchorDateStr);
        if (!already) pushOccurrence(anchorDateStr);
      }
    }
  }

  return occurrences.sort((a, b) => (a.date === b.date ? a.startMinutes - b.startMinutes : a.date < b.date ? -1 : 1));
}

export function getOccurrencesForEvents(events, rangeStart, rangeEnd) {
  return events.flatMap((e) => getOccurrencesForRange(e, rangeStart, rangeEnd));
}
