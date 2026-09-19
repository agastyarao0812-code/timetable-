import { useMemo, useState } from "react";
import { usePlannerActions } from "../../store/PlannerContext";
import { parseFlashcardImport } from "../../lib/flashcardImport";
import Modal from "../shared/Modal";

export default function ImportModal({ deckId, onClose }) {
  const actions = usePlannerActions();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");

  const { cards, skipped } = useMemo(() => parseFlashcardImport(text), [text]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ""));
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (cards.length === 0) return;
    actions.addCardsBulk(cards.map((c) => ({ ...c, deckId })));
    onClose();
  };

  return (
    <Modal title="Import cards" onClose={onClose} wide>
      <div className="form">
        <p className="import-hint">
          Paste flashcards below, or upload a file. Each line can be <code>front{"\t"}back</code> (tab-separated,
          e.g. from a spreadsheet or Quizlet export), <code>front :: back</code>, <code>front | back</code>,
          <code> front - back</code>, or a simple two-column CSV line. You can also paste JSON: an array of
          <code>{"{front, back}"}</code> objects (or <code>question/answer</code>, <code>term/definition</code>).
        </p>

        <label>
          Upload a file (.txt, .csv, .tsv, .json)
          <input type="file" accept=".txt,.csv,.tsv,.json,text/plain,text/csv,application/json" onChange={handleFile} />
        </label>
        {fileName && <p className="import-hint">Loaded {fileName}</p>}

        <label>
          Or paste text
          <textarea
            className="import-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"bonjour\thello\nmerci\tthank you"}
          />
        </label>

        <p className="import-preview">
          {text.trim() ? (
            <>
              Found <strong>{cards.length}</strong> card{cards.length === 1 ? "" : "s"} to import.
              {skipped > 0 && ` (${skipped} line${skipped === 1 ? "" : "s"} couldn't be parsed and will be skipped.)`}
            </>
          ) : (
            "Nothing to import yet."
          )}
        </p>

        <div className="modal-actions">
          <div style={{ flex: 1 }} />
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" disabled={cards.length === 0} onClick={handleImport}>
            Import {cards.length > 0 ? cards.length : ""} card{cards.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
