import { useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { todayStr } from "../../lib/dateUtils";
import Modal from "../shared/Modal";

export default function DeadlineModal({ deadline, onClose, onAddSubject }) {
  const { subjects } = usePlannerState();
  const actions = usePlannerActions();
  const isEdit = !!deadline;

  const [title, setTitle] = useState(deadline?.title || "");
  const [subjectId, setSubjectId] = useState(deadline?.subjectId || subjects[0]?.id || "");
  const [type, setType] = useState(deadline?.type || "assignment");
  const [dueDate, setDueDate] = useState(deadline?.dueDate || todayStr());
  const [notes, setNotes] = useState(deadline?.notes || "");

  const handleSave = () => {
    if (!title.trim() || !dueDate) return;
    const payload = { title: title.trim(), subjectId: subjectId || null, type, dueDate, notes };
    if (isEdit) {
      actions.updateDeadline(deadline.id, payload);
    } else {
      actions.addDeadline(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    actions.deleteDeadline(deadline.id);
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit deadline" : "Add deadline"} onClose={onClose}>
      <div className="form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. History essay" autoFocus />
        </label>

        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          Subject
          <div className="preset-row">
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={{ flex: 1 }}>
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn-ghost" onClick={onAddSubject}>
              + New
            </button>
          </div>
        </label>

        <label>
          Due date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
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
