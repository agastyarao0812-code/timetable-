import { useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { makeEvent } from "../../lib/defaultData";
import { WEEKDAY_LABELS, timeStrToMinutes, minutesToTimeStr } from "../../lib/dateUtils";
import Modal from "../shared/Modal";

const DURATION_PRESETS = [30, 60, 90, 120];

export default function EventModal({ mode, initial, occurrence, onClose }) {
  const { categories, subjects } = usePlannerState();
  const actions = usePlannerActions();

  const baseEvent = mode === "edit" ? occurrence.event : null;
  const linkedSubject = baseEvent?.subjectId ? subjects.find((s) => s.id === baseEvent.subjectId) : null;

  const [title, setTitle] = useState(baseEvent?.title || "");
  const [categoryId, setCategoryId] = useState(baseEvent?.categoryId || initial?.categoryId || categories[0]?.id);
  const [date, setDate] = useState(mode === "edit" ? occurrence.date : initial.date);
  const [startTime, setStartTime] = useState(
    minutesToTimeStr(mode === "edit" ? occurrence.startMinutes : initial.startMinutes)
  );
  const [duration, setDuration] = useState(mode === "edit" ? occurrence.durationMinutes : initial.durationMinutes || 60);
  const [notes, setNotes] = useState(baseEvent?.notes || "");
  const [isRecurring, setIsRecurring] = useState(!!baseEvent?.recurrence);
  const [daysOfWeek, setDaysOfWeek] = useState(baseEvent?.recurrence?.daysOfWeek || []);
  const [until, setUntil] = useState(baseEvent?.recurrence?.until || "");
  const [occurrenceOnly, setOccurrenceOnly] = useState(false);

  const toggleDay = (d) => {
    setDaysOfWeek((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const handleSave = () => {
    const startMinutes = timeStrToMinutes(startTime);

    if (mode === "edit" && occurrenceOnly && baseEvent.recurrence) {
      actions.setEventException(baseEvent.id, occurrence.anchorDate, {
        date,
        startMinutes,
        durationMinutes: Number(duration),
      });
      onClose();
      return;
    }

    const recurrence = isRecurring && daysOfWeek.length > 0 ? { daysOfWeek, until: until || null } : null;

    if (mode === "create") {
      const event = makeEvent({
        title: title.trim() || "Untitled",
        categoryId,
        date,
        startMinutes,
        durationMinutes: Number(duration),
        notes,
        recurrence,
      });
      actions.addEvent(event);
    } else {
      actions.updateEvent(baseEvent.id, {
        title: title.trim() || "Untitled",
        categoryId: linkedSubject ? baseEvent.categoryId : categoryId,
        date,
        startMinutes,
        durationMinutes: Number(duration),
        notes,
        recurrence,
      });
    }
    onClose();
  };

  const handleDeleteOccurrence = () => {
    actions.setEventException(baseEvent.id, occurrence.anchorDate, "deleted");
    onClose();
  };

  const handleDeleteSeries = () => {
    actions.deleteEvent(baseEvent.id);
    onClose();
  };

  const isLocked = baseEvent?.locked;

  return (
    <Modal onClose={onClose} title={mode === "create" ? "Add event" : isLocked ? "Outlook event" : "Edit event"}>
      <div className="form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLocked} placeholder="e.g. Linear Algebra lecture" />
        </label>

        {linkedSubject ? (
          <div className="suggestion-subject">
            <span className="subject-dot" style={{ background: linkedSubject.color }} />
            {linkedSubject.name} (revision block)
          </div>
        ) : (
          <label>
            Category
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={isLocked}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="form-row">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isLocked} />
          </label>
          <label>
            Start
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isLocked} />
          </label>
        </div>

        <label>
          Duration (minutes)
          <div className="preset-row">
            {DURATION_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className={`chip ${Number(duration) === p ? "chip-active" : ""}`}
                onClick={() => setDuration(p)}
                disabled={isLocked}
              >
                {p}
              </button>
            ))}
            <input
              type="number"
              min="5"
              step="5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ width: 70 }}
              disabled={isLocked}
            />
          </div>
        </label>

        {!isLocked && !occurrenceOnly && (
          <label className="checkbox-row">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            Repeats weekly
          </label>
        )}

        {isRecurring && !isLocked && (
          <div className="form-row-wrap">
            <div className="weekday-row">
              {WEEKDAY_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`chip chip-round ${daysOfWeek.includes(idx) ? "chip-active" : ""}`}
                  onClick={() => toggleDay(idx)}
                >
                  {label[0]}
                </button>
              ))}
            </div>
            <label>
              Repeat until (optional)
              <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
            </label>
          </div>
        )}

        {mode === "edit" && baseEvent?.recurrence && !isLocked && (
          <label className="checkbox-row">
            <input type="checkbox" checked={occurrenceOnly} onChange={(e) => setOccurrenceOnly(e.target.checked)} />
            Only change this occurrence ({occurrence.date})
          </label>
        )}

        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} disabled={isLocked} />
        </label>

        <div className="modal-actions">
          {mode === "edit" && !isLocked && (
            <>
              {baseEvent.recurrence ? (
                <>
                  <button type="button" className="btn-danger-ghost" onClick={handleDeleteOccurrence}>
                    Delete this occurrence
                  </button>
                  <button type="button" className="btn-danger-ghost" onClick={handleDeleteSeries}>
                    Delete series
                  </button>
                </>
              ) : (
                <button type="button" className="btn-danger-ghost" onClick={handleDeleteSeries}>
                  Delete
                </button>
              )}
            </>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          {!isLocked && (
            <button type="button" className="btn-primary" onClick={handleSave}>
              Save
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
