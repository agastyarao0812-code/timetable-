import { useMemo } from "react";
import { usePlannerState } from "../../store/PlannerContext";
import { getOccurrencesForEvents } from "../../lib/recurrence";
import { formatDate } from "../../lib/dateUtils";

export function useCalendarData(days) {
  const { events, categories, subjects } = usePlannerState();

  const categoriesById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const subjectsById = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);

  const occurrencesByDate = useMemo(() => {
    if (!days.length) return {};
    const rangeStart = days[0];
    const rangeEnd = days[days.length - 1];
    const occs = getOccurrencesForEvents(events, rangeStart, rangeEnd);
    const map = {};
    for (const occ of occs) {
      (map[occ.date] ||= []).push(occ);
    }
    return map;
  }, [events, days]);

  return { categoriesById, subjectsById, occurrencesByDate, days: days.map(formatDate) };
}
