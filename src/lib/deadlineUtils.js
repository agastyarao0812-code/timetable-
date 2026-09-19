import { daysBetween, todayStr } from "./dateUtils";

export function daysUntil(dueDate) {
  return daysBetween(todayStr(), dueDate);
}

export function urgencyLevel(days) {
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  if (days <= 7) return "upcoming";
  return "later";
}

export function urgencyLabel(days) {
  if (days < 0) return `Overdue by ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
}

export function sortByDueDate(deadlines) {
  return [...deadlines].sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
}

export function getBannerDeadlines(deadlines, thresholdDays, dismissedBanners) {
  const today = todayStr();
  return sortByDueDate(deadlines).filter((d) => {
    if (!d.dueDate) return false;
    const days = daysUntil(d.dueDate);
    if (days > thresholdDays) return false;
    if (dismissedBanners[d.id] === today) return false;
    return true;
  });
}
