import { useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { minutesToTimeStr, timeStrToMinutes } from "../../lib/dateUtils";
import Modal from "../shared/Modal";

const DURATION_PRESETS = [30, 60, 90, 120];

export default function SuggestionModal({ occurrence, onClose }) {
  const { subjects } = usePlannerState();
  const actions = usePlannerActions();
  const event = occurrence.event;
  const subject = subjects.find((s) => s.id === event.subjectId);

  const [date, setDate] = useState(occurrence.date);
  const [startTime, setStartTime] = useState(minutesToTimeStr(occurrence.startMinutes));
  const [duration, setDuration] = useState(occurrence.durationMinutes);

  const buildPatch = () => ({
    date,
    startMinutes: timeStrToMinutes(startTime),
    durationMinutes: Number(duration),
  });

  const handleMove = () => {
    actions.updateEvent(event.id, buildPatch());
    onClose();
  };

  const handleAccept = () => {
    actions.updateEvent(event.id, { ...buildPatch(), status: "confirmed" });
    onClose();
  };

  const handleDelete = () => {
    actions.deleteEvent(event.id);
    onClose();
  };

  return (
    <Modal title="Suggested study block" onClose={onClose}>
      <div className="form">
        <div className="suggestion-subject">
          <span className="subject-dot" style={{ background: subject?.color || "var(--text-dim)" }} />
          {subject?.name || "Study"}
        </div>

        <div className="form-row">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Start
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
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
              >
                {p}
              </button>
            ))}
          </div>
        </label>

        <p className="suggestion-hint">
          This is a suggestion, not yet on your calendar for real. Accept it to confirm, adjust the time and save to
          move it, or delete it to reject.
        </p>

        <div className="modal-actions">
          <button type="button" className="btn-danger-ghost" onClick={handleDelete}>
            Delete
          </button>
          <div style={{ flex: 1 }} />
          <button type="button" className="btn-ghost" onClick={handleMove}>
            Save move
          </button>
          <button type="button" className="btn-primary" onClick={handleAccept}>
            Accept
          </button>
        </div>
      </div>
    </Modal>
  );
}
