import { useMemo, useState } from "react";
import { usePlannerState } from "../../store/PlannerContext";
import { formatDate, WEEKDAY_LABELS_LONG } from "../../lib/dateUtils";
import { useCalendarData } from "./useCalendarData";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";

export default function TodayView() {
  const { settings } = usePlannerState();
  const [modalState, setModalState] = useState(null);
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => [today], [today]);
  const { categoriesById, occurrencesByDate } = useCalendarData(days);

  return (
    <div className="view-pane">
      <div className="view-toolbar">
        <h2 className="toolbar-title">
          {WEEKDAY_LABELS_LONG[today.getDay()]}, {today.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
        </h2>
        <button
          className="btn-primary"
          onClick={() =>
            setModalState({
              mode: "create",
              initial: { date: formatDate(today), startMinutes: 9 * 60, durationMinutes: 60 },
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
