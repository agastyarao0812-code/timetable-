import { useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { nextSubjectColor, SUBJECT_PALETTE } from "../../lib/defaultData";
import Modal from "../shared/Modal";

export default function SubjectModal({ subject, onClose }) {
  const { subjects } = usePlannerState();
  const actions = usePlannerActions();
  const isEdit = !!subject;

  const [name, setName] = useState(subject?.name || "");
  const [color, setColor] = useState(subject?.color || nextSubjectColor(subjects));
  const [hoursPerWeek, setHoursPerWeek] = useState(subject?.hoursPerWeek ?? 3);

  const handleSave = () => {
    if (!name.trim()) return;
    if (isEdit) {
      actions.updateSubject(subject.id, { name: name.trim(), color, hoursPerWeek: Number(hoursPerWeek) });
    } else {
      actions.addSubject({ name: name.trim(), color, hoursPerWeek: Number(hoursPerWeek) });
    }
    onClose();
  };

  const handleDelete = () => {
    actions.deleteSubject(subject.id);
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit subject" : "Add subject"} onClose={onClose}>
      <div className="form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. History" autoFocus />
        </label>
        <label>
          Color
          <div className="preset-row">
            {SUBJECT_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch ${color === c ? "color-swatch-active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c}
              />
            ))}
          </div>
        </label>
        <label>
          Target study hours / week
          <input
            type="number"
            min="0"
            step="0.5"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
          />
        </label>
        <div className="modal-actions">
          {isEdit && (
            <button type="button" className="btn-danger-ghost" onClick={handleDelete}>
              Delete subject
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
