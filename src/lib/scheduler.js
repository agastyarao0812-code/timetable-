import { formatDate, todayStr, daysBetween } from "./dateUtils";
import { getOccurrencesForEvents } from "./recurrence";
import { makeEvent } from "./defaultData";

const MAX_BLOCK_MINUTES = 120;
const MIN_BLOCK_MINUTES = 30;

function mergeAndInvert(busyIntervals, dayStart, dayEnd) {
  const sorted = [...busyIntervals].sort((a, b) => a.start - b.start);
  const merged = [];
  for (const iv of sorted) {
    if (merged.length && iv.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, iv.end);
    } else {
      merged.push({ ...iv });
    }
  }
  const free = [];
  let cursor = dayStart;
  for (const iv of merged) {
    const start = Math.max(iv.start, dayStart);
    const end = Math.min(iv.end, dayEnd);
    if (start > cursor) free.push({ start: cursor, end: Math.min(start, dayEnd) });
    cursor = Math.max(cursor, end);
    if (cursor >= dayEnd) break;
  }
  if (cursor < dayEnd) free.push({ start: cursor, end: dayEnd });
  return free.filter((f) => f.end - f.start >= MIN_BLOCK_MINUTES);
}

// Computes free (non-busy) intervals per day for the given week, based on all
// events whose status is NOT in excludeStatuses (defaults to including everything).
export function computeFreeIntervals(days, events, settings, { excludeStatuses = [] } = {}) {
  const dayStart = settings.dayStartHour * 60;
  const dayEnd = settings.dayEndHour * 60;
  const rangeStart = days[0];
  const rangeEnd = days[days.length - 1];
  const relevantEvents = events.filter((e) => !excludeStatuses.includes(e.status));
  const occs = getOccurrencesForEvents(relevantEvents, rangeStart, rangeEnd);

  const busyByDate = {};
  for (const occ of occs) {
    (busyByDate[occ.date] ||= []).push({ start: occ.startMinutes, end: occ.startMinutes + occ.durationMinutes });
  }

  const today = todayStr();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const free = {};
  for (const d of days) {
    const dStr = formatDate(d);
    if (dStr < today) {
      free[dStr] = [];
      continue;
    }
    let effectiveStart = dayStart;
    if (dStr === today) effectiveStart = Math.min(dayEnd, Math.max(dayStart, Math.ceil(nowMinutes / 30) * 30));
    free[dStr] = mergeAndInvert(busyByDate[dStr] || [], effectiveStart, dayEnd);
  }
  return free;
}

function nearestDeadlineDays(subjectId, deadlines, today) {
  let nearest;
  for (const d of deadlines) {
    if (d.subjectId !== subjectId || !d.dueDate) continue;
    const daysOut = daysBetween(today, d.dueDate);
    if (daysOut < 0) continue;
    if (nearest === undefined || daysOut < nearest) nearest = daysOut;
  }
  return nearest;
}

function hoursOfConfirmedStudyInWeek(subjectId, events, days) {
  const studyEvents = events.filter((e) => e.type === "study" && e.subjectId === subjectId && e.status === "confirmed");
  const occs = getOccurrencesForEvents(studyEvents, days[0], days[days.length - 1]);
  return occs.reduce((sum, o) => sum + o.durationMinutes / 60, 0);
}

// Returns per-subject stats for a given week: target/logged/scheduled/remaining hours
// and days until that subject's nearest upcoming deadline (if any).
export function getWeekStatsForSubjects(subjects, deadlines, events, days) {
  const today = todayStr();
  const weekDates = days.map(formatDate);
  return subjects.map((s) => {
    const loggedHours = weekDates.reduce((sum, dStr) => sum + (s.studyLog[dStr] || 0), 0);
    const scheduledHours = hoursOfConfirmedStudyInWeek(s.id, events, days);
    const targetHours = s.hoursPerWeek || 0;
    const remainingHours = Math.max(0, targetHours - loggedHours - scheduledHours);
    const daysUntilDeadline = nearestDeadlineDays(s.id, deadlines, today);
    return { subject: s, targetHours, loggedHours, scheduledHours, remainingHours, daysUntilDeadline };
  });
}

function findEarliestSlot(freeIntervals, weekDates) {
  for (const dStr of weekDates) {
    const intervals = freeIntervals[dStr] || [];
    for (const iv of intervals) {
      if (iv.end - iv.start >= MIN_BLOCK_MINUTES) return { date: dStr, start: iv.start, end: iv.end };
    }
  }
  return null;
}

function occupy(freeIntervals, dateStr, start, duration) {
  const intervals = freeIntervals[dateStr];
  const idx = intervals.findIndex((iv) => iv.start <= start && iv.end >= start + duration);
  if (idx === -1) return;
  const iv = intervals[idx];
  const end = start + duration;
  const replacement = [];
  if (start - iv.start >= MIN_BLOCK_MINUTES) replacement.push({ start: iv.start, end: start });
  if (iv.end - end >= MIN_BLOCK_MINUTES) replacement.push({ start: end, end: iv.end });
  intervals.splice(idx, 1, ...replacement);
}

// Generates suggested (status: 'suggested') study block events that fit into free time
// for the given week, prioritizing subjects with the closest deadlines first and
// round-robining across subjects so no single subject hogs the whole week.
export function generateStudySuggestions({ subjects, deadlines, events, settings, days }) {
  const weekDates = days.map(formatDate);
  const freeIntervals = computeFreeIntervals(days, events, settings, { excludeStatuses: ["suggested"] });

  const stats = getWeekStatsForSubjects(subjects, deadlines, events, days);
  const queue = stats
    .filter((s) => s.remainingHours > 0)
    .map((s) => ({ ...s, remaining: s.remainingHours }))
    .sort((a, b) => {
      const aDays = a.daysUntilDeadline ?? 999;
      const bDays = b.daysUntilDeadline ?? 999;
      return aDays - bDays || b.remaining - a.remaining;
    });

  const suggestions = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (const item of queue) {
      if (item.remaining <= 0) continue;
      const slot = findEarliestSlot(freeIntervals, weekDates);
      if (!slot) continue;

      const desired = Math.min(item.remaining * 60, MAX_BLOCK_MINUTES, slot.end - slot.start);
      const rounded = Math.max(MIN_BLOCK_MINUTES, Math.round(desired / 30) * 30);
      const actual = Math.min(rounded, slot.end - slot.start);
      if (actual < MIN_BLOCK_MINUTES) continue;

      suggestions.push(
        makeEvent({
          title: `Study: ${item.subject.name}`,
          categoryId: null,
          type: "study",
          subjectId: item.subject.id,
          date: slot.date,
          startMinutes: slot.start,
          durationMinutes: actual,
          status: "suggested",
          source: "scheduler",
        })
      );

      occupy(freeIntervals, slot.date, slot.start, actual);
      item.remaining -= actual / 60;
      progress = true;
    }
  }

  return suggestions;
}
