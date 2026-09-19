import { useMemo, useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { addDays, minutesToLabel, todayStr } from "../../lib/dateUtils";
import { getOccurrencesForEvents } from "../../lib/recurrence";
import Modal from "../shared/Modal";

export default function TaskModal({ task, onClose }) {
  const { events } = usePlannerState();
  const actions = usePlannerActions();
  const isEdit = !!task;

  const [text, setText] = useState(task?.text || "");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [linkedEventId, setLinkedEventId] = useState(task?.linkedEventId || "");

  const upcomingOccurrences = useMemo(() => {
    const today = new Date();
    const end = addDays(today, 7);
    return getOccurrencesForEvents(events, today, end)
      .filter((o) => o.event.status === "confirmed")
      .sort((a, b) => (a.date === b.date ? a.startMinutes - b.startMinutes : a.date < b.date ? -1 : 1))
      .slice(0, 50);
  }, [events]);

  const handleSave = () => {
    if (!text.trim()) return;
    const payload = { text: text.trim(), dueDate: dueDate || null, linkedEventId: linkedEventId || null };
    if (isEdit) {
      actions.updateTask(task.id, payload);
    } else {
      actions.addTask(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    actions.deleteTask(task.id);
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit task" : "Add task"} onClose={onClose}>
      <div className="form">
        <label>
          Task
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Finish essay outline" autoFocus />
        </label>

        <label>
          Due date (optional)
          <input type="date" value={dueDate} min={todayStr()} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <label>
          Link to a calendar event (optional)
          <select value={linkedEventId} onChange={(e) => setLinkedEventId(e.target.value)}>
            <option value="">No link</option>
            {upcomingOccurrences.map((occ) => (
              <option key={occ.occurrenceId} value={occ.event.id}>
                {occ.event.title} — {occ.date} {minutesToLabel(occ.startMinutes)}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          {isEdit && (
            <button type="button" className="btn-danger-ghost" onClick={handleDelete}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
