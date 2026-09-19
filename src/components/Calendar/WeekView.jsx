import { useMemo, useState } from "react";
import { usePlannerState } from "../../store/PlannerContext";
import { addDays, formatDate, formatMonthYear, getWeekDates } from "../../lib/dateUtils";
import { useCalendarData } from "./useCalendarData";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";

export default function WeekView() {
  const { settings } = usePlannerState();
  const [anchor, setAnchor] = useState(new Date());
  const [modalState, setModalState] = useState(null);

  const days = useMemo(() => getWeekDates(anchor, settings.weekStartsOn), [anchor, settings.weekStartsOn]);
  const { categoriesById, occurrencesByDate } = useCalendarData(days);

  return (
    <div className="view-pane">
      <div className="view-toolbar">
        <div className="toolbar-group">
          <button className="btn-ghost" onClick={() => setAnchor((d) => addDays(d, -7))}>
            ← Prev
          </button>
          <button className="btn-ghost" onClick={() => setAnchor(new Date())}>
            Today
          </button>
          <button className="btn-ghost" onClick={() => setAnchor((d) => addDays(d, 7))}>
            Next →
          </button>
        </div>
        <h2 className="toolbar-title">{formatMonthYear(days[0])}</h2>
        <button
          className="btn-primary"
          onClick={() =>
            setModalState({
              mode: "create",
              initial: { date: days[0] ? formatDate(days[0]) : "", startMinutes: 9 * 60, durationMinutes: 60 },
            })
          }
        >
          + Add event
        </button>
      </div>

      <CalendarGrid
        days={days}
        occurrencesByDate={occurrencesByDate}
        categoriesById={categoriesById}
        dayStartHour={settings.dayStartHour}
        dayEndHour={settings.dayEndHour}
        slotMinutes={settings.slotMinutes}
        onSlotClick={(date, startMinutes) =>
          setModalState({ mode: "create", initial: { date, startMinutes, durationMinutes: 60 } })
        }
        onEventClick={(occurrence) => setModalState({ mode: "edit", occurrence })}
      />

      {modalState && <EventModal {...modalState} onClose={() => setModalState(null)} />}
    </div>
  );
}
