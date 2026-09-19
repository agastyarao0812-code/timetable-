import { useMemo } from "react";
import { formatDate, minutesToLabel, todayStr, WEEKDAY_LABELS } from "../../lib/dateUtils";
import { layoutOccurrences } from "../../lib/layout";
import "./calendar.css";

const ROW_HEIGHT = 26; // px per slot

export default function CalendarGrid({
  days,
  occurrencesByDate,
  categoriesById,
  dayStartHour,
  dayEndHour,
  slotMinutes,
  onSlotClick,
  onEventClick,
}) {
  const dayStartMinutes = dayStartHour * 60;
  const dayEndMinutes = dayEndHour * 60;
  const slotCount = Math.round((dayEndMinutes - dayStartMinutes) / slotMinutes);
  const totalHeight = slotCount * ROW_HEIGHT;

  const timeLabels = useMemo(() => {
    const labels = [];
    for (let m = dayStartMinutes; m < dayEndMinutes; m += 60) {
      labels.push(m);
    }
    return labels;
  }, [dayStartMinutes, dayEndMinutes]);

  const today = todayStr();

  return (
    <div className="cal-wrap">
      <div className="cal-header-row">
        <div className="cal-gutter" />
        {days.map((d) => {
          const dStr = formatDate(d);
          return (
            <div key={dStr} className={`cal-day-header ${dStr === today ? "is-today" : ""}`}>
              <span className="cal-day-name">{WEEKDAY_LABELS[d.getDay()]}</span>
              <span className="cal-day-num">{d.getDate()}</span>
            </div>
          );
        })}
      </div>
      <div className="cal-body" style={{ height: totalHeight }}>
        <div className="cal-gutter">
          {timeLabels.map((m) => (
            <div key={m} className="cal-time-label" style={{ top: ((m - dayStartMinutes) / slotMinutes) * ROW_HEIGHT }}>
              {minutesToLabel(m)}
            </div>
          ))}
        </div>
        {days.map((d) => {
          const dStr = formatDate(d);
          const occs = layoutOccurrences(occurrencesByDate[dStr] || []);
          return (
            <div
              key={dStr}
              className={`cal-day-col ${dStr === today ? "is-today" : ""}`}
              onClick={(e) => {
                if (e.target !== e.currentTarget) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                const slot = Math.floor(offsetY / ROW_HEIGHT);
                const startMinutes = dayStartMinutes + slot * slotMinutes;
                onSlotClick(dStr, startMinutes);
              }}
            >
              {Array.from({ length: slotCount }).map((_, i) => (
                <div
                  key={i}
                  className={`cal-slot-line ${i % (60 / slotMinutes) === 0 ? "cal-slot-hour" : ""}`}
                  style={{ top: i * ROW_HEIGHT }}
                />
              ))}
              {occs.map((occ) => {
                const cat = categoriesById[occ.event.categoryId];
                const top = ((occ.startMinutes - dayStartMinutes) / slotMinutes) * ROW_HEIGHT;
                const height = Math.max((occ.durationMinutes / slotMinutes) * ROW_HEIGHT - 2, 16);
                const widthPct = 100 / occ.columnCount;
                const isSuggested = occ.event.status === "suggested";
                return (
                  <button
                    key={occ.occurrenceId}
                    className={`cal-event ${isSuggested ? "cal-event-suggested" : ""} ${occ.event.locked ? "cal-event-locked" : ""}`}
                    style={{
                      top,
                      height,
                      left: `${occ.col * widthPct}%`,
                      width: `calc(${widthPct}% - 3px)`,
                      "--evt-color": cat?.color || "#8f97a8",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(occ);
                    }}
                    title={`${occ.event.title} (${minutesToLabel(occ.startMinutes)})`}
                  >
                    <span className="cal-event-title">{occ.event.title}</span>
                    {height > 32 && <span className="cal-event-time">{minutesToLabel(occ.startMinutes)}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
