import { addDaysToStr, formatDate, todayStr } from "./dateUtils";

export function countDoneThisWeek(checklist, days) {
  const weekDates = new Set(days.map(formatDate));
  return checklist.filter((t) => t.done && t.doneAt && weekDates.has(t.doneAt)).length;
}

// Consecutive days (ending today, or yesterday if nothing done yet today) with at least one completed task.
export function getStreak(checklist) {
  const doneDates = new Set(checklist.filter((t) => t.done && t.doneAt).map((t) => t.doneAt));
  let cursor = todayStr();
  if (!doneDates.has(cursor)) {
    cursor = addDaysToStr(cursor, -1);
  }
  let streak = 0;
  while (doneDates.has(cursor)) {
    streak += 1;
    cursor = addDaysToStr(cursor, -1);
  }
  return streak;
}

export function sortChecklist(checklist) {
  return [...checklist].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const aDate = a.dueDate || "9999-99-99";
    const bDate = b.dueDate || "9999-99-99";
    if (aDate !== bDate) return aDate < bDate ? -1 : 1;
    return a.createdAt - b.createdAt;
  });
}
