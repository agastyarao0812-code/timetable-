import { formatDate, WEEKDAY_LABELS_LONG } from "./dateUtils";
import { getOccurrencesForEvents } from "./recurrence";
import { getWeekStatsForSubjects } from "./scheduler";
import { daysUntil } from "./deadlineUtils";

const OVERLOAD_MINUTES = 8 * 60;

function countCategoryOccurrences(events, categoryId, days) {
  const matching = events.filter((e) => e.categoryId === categoryId && e.status === "confirmed");
  return getOccurrencesForEvents(matching, days[0], days[days.length - 1]).length;
}

// Generates a handful of rule-based tips for the week, most relevant first.
export function getDailySuggestions({ events, subjects, deadlines, targets, days }) {
  const tips = [];
  const confirmedEvents = events.filter((e) => e.status === "confirmed");
  const occs = getOccurrencesForEvents(confirmedEvents, days[0], days[days.length - 1]);

  // Overload check: any day with more than OVERLOAD_MINUTES of scheduled time.
  const minutesByDate = {};
  for (const occ of occs) {
    minutesByDate[occ.date] = (minutesByDate[occ.date] || 0) + occ.durationMinutes;
  }
  for (const d of days) {
    const dStr = formatDate(d);
    const minutes = minutesByDate[dStr] || 0;
    if (minutes > OVERLOAD_MINUTES) {
      tips.push({
        id: `overload-${dStr}`,
        level: "warn",
        text: `${WEEKDAY_LABELS_LONG[d.getDay()]} is overloaded (${Math.round(minutes / 60)}h scheduled).`,
      });
    }
  }

  // Deadlines with little planned time relative to target.
  const stats = getWeekStatsForSubjects(subjects, deadlines, events, days);
  const statsBySubject = Object.fromEntries(stats.map((s) => [s.subject.id, s]));
  for (const dl of deadlines) {
    if (!dl.subjectId || !dl.dueDate) continue;
    const days_ = daysUntil(dl.dueDate);
    if (days_ < 0 || days_ > 7) continue;
    const stat = statsBySubject[dl.subjectId];
    if (!stat || stat.targetHours <= 0) continue;
    const planned = stat.loggedHours + stat.scheduledHours;
    if (planned < stat.targetHours * 0.5) {
      tips.push({
        id: `deadline-${dl.id}`,
        level: "warn",
        text: `"${dl.title}" due in ${days_}d with only ${planned}h planned this week (target ${stat.targetHours}h).`,
      });
    }
  }

  // Exercise target.
  if (targets.exercise?.perWeek > 0) {
    const count = countCategoryOccurrences(events, targets.exercise.categoryId, days);
    if (count === 0) {
      tips.push({ id: "no-exercise", level: "info", text: "No exercise scheduled this week." });
    } else if (count < targets.exercise.perWeek) {
      tips.push({
        id: "low-exercise",
        level: "info",
        text: `Only ${count}/${targets.exercise.perWeek} workouts scheduled this week.`,
      });
    }
  }

  // Personal / rest time target.
  if (targets.personal?.perWeek > 0) {
    const count = countCategoryOccurrences(events, targets.personal.categoryId, days);
    if (count === 0) {
      tips.push({ id: "no-rest", level: "info", text: "No rest day or free evening scheduled this week." });
    } else if (count < targets.personal.perWeek) {
      tips.push({
        id: "low-rest",
        level: "info",
        text: `Only ${count}/${targets.personal.perWeek} free evenings scheduled this week.`,
      });
    }
  }

  return tips.slice(0, 6);
}
