import { useMemo } from "react";
import { usePlannerState } from "../../store/PlannerContext";
import { getWeekDates } from "../../lib/dateUtils";
import { getDailySuggestions } from "../../lib/suggestionsEngine";
import "./suggestions.css";

export default function DailySuggestions() {
  const { events, subjects, deadlines, targets, settings } = usePlannerState();
  const days = useMemo(() => getWeekDates(new Date(), settings.weekStartsOn), [settings.weekStartsOn]);

  const tips = useMemo(
    () => getDailySuggestions({ events, subjects, deadlines, targets, days }),
    [events, subjects, deadlines, targets, days]
  );

  if (tips.length === 0) return null;

  return (
    <div className="suggestions-panel">
      <h3 className="suggestions-title">Today's tips</h3>
      <ul className="suggestions-list">
        {tips.map((tip) => (
          <li key={tip.id} className={`suggestion-tip tip-${tip.level}`}>
            {tip.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
