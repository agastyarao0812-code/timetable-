import { useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { nextDeckColor, DECK_PALETTE } from "../../lib/defaultData";
import Modal from "../shared/Modal";

export default function DeckModal({ deck, onClose, onCreated, onDeleted }) {
  const { decks } = usePlannerState();
  const actions = usePlannerActions();
  const isEdit = !!deck;

  const [name, setName] = useState(deck?.name || "");
  const [description, setDescription] = useState(deck?.description || "");
  const [color, setColor] = useState(deck?.color || nextDeckColor(decks));

  const handleSave = () => {
    if (!name.trim()) return;
    const payload = { name: name.trim(), description: description.trim(), color };
    if (isEdit) {
      actions.updateDeck(deck.id, payload);
      onClose();
    } else {
      const id = actions.addDeck(payload);
      onClose();
      onCreated?.(id);
    }
  };

  const handleDelete = () => {
    actions.deleteDeck(deck.id);
    onClose();
    onDeleted?.();
  };

  return (
    <Modal title={isEdit ? "Edit deck" : "New deck"} onClose={onClose}>
      <div className="form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Spanish vocab" autoFocus />
        </label>

        <label>
          Description (optional)
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this deck for?" />
        </label>

        <label>
          Color
          <div className="preset-row">
            {DECK_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch ${color === c ? "color-swatch-active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </label>

        <div className="modal-actions">
          {isEdit && (
            <button type="button" className="btn-danger-ghost" onClick={handleDelete}>
              Delete deck
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
