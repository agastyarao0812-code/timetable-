import { useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import Modal from "../shared/Modal";

export default function TargetsModal({ onClose }) {
  const { targets } = usePlannerState();
  const actions = usePlannerActions();

  const [exercisePerWeek, setExercisePerWeek] = useState(targets.exercise.perWeek);
  const [exerciseDuration, setExerciseDuration] = useState(targets.exercise.durationMinutes);
  const [personalPerWeek, setPersonalPerWeek] = useState(targets.personal.perWeek);
  const [personalDuration, setPersonalDuration] = useState(targets.personal.durationMinutes);

  const handleSave = () => {
    actions.updateTargets({
      exercise: { ...targets.exercise, perWeek: Number(exercisePerWeek), durationMinutes: Number(exerciseDuration) },
      personal: { ...targets.personal, perWeek: Number(personalPerWeek), durationMinutes: Number(personalDuration) },
    });
    onClose();
  };

  return (
    <Modal title="Weekly targets" onClose={onClose}>
      <div className="form">
        <strong>Exercise</strong>
        <div className="form-row">
          <label>
            Times / week
            <input type="number" min="0" value={exercisePerWeek} onChange={(e) => setExercisePerWeek(e.target.value)} />
          </label>
          <label>
            Minutes each
            <input type="number" min="5" step="5" value={exerciseDuration} onChange={(e) => setExerciseDuration(e.target.value)} />
          </label>
        </div>

        <strong>Personal / rest time</strong>
        <div className="form-row">
          <label>
            Times / week
            <input type="number" min="0" value={personalPerWeek} onChange={(e) => setPersonalPerWeek(e.target.value)} />
          </label>
          <label>
            Minutes each
            <input type="number" min="5" step="5" value={personalDuration} onChange={(e) => setPersonalDuration(e.target.value)} />
          </label>
        </div>

        <div className="modal-actions">
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
