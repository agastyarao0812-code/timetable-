import { useState } from "react";
import { usePlannerActions } from "../../store/PlannerContext";
import Modal from "../shared/Modal";

export default function CardModal({ deckId, card, onClose }) {
  const actions = usePlannerActions();
  const isEdit = !!card;

  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");

  const handleSave = () => {
    if (!front.trim() || !back.trim()) return;
    if (isEdit) {
      actions.updateCard(card.id, { front: front.trim(), back: back.trim() });
    } else {
      actions.addCard({ deckId, front: front.trim(), back: back.trim() });
    }
    onClose();
  };

  const handleDelete = () => {
    actions.deleteCard(card.id);
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit card" : "Add card"} onClose={onClose}>
      <div className="form">
        <label>
          Front
          <textarea rows={3} value={front} onChange={(e) => setFront(e.target.value)} placeholder="Question or term" autoFocus />
        </label>

        <label>
          Back
          <textarea rows={3} value={back} onChange={(e) => setBack(e.target.value)} placeholder="Answer or definition" />
        </label>

        <div className="modal-actions">
          {isEdit && (
            <button type="button" className="btn-danger-ghost" onClick={handleDelete}>
              Delete card
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
