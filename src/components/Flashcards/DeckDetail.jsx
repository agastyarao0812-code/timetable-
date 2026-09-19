import { useMemo, useState } from "react";
import { usePlannerState } from "../../store/PlannerContext";
import { cardsForDeck, deckStats, dueCardsForDeck } from "../../lib/flashcardUtils";
import CardModal from "./CardModal";
import ImportModal from "./ImportModal";
import DeckModal from "./DeckModal";
import StudySession from "./StudySession";

export default function DeckDetail({ deck, onBack }) {
  const { cards } = usePlannerState();
  const [editingCard, setEditingCard] = useState(null);
  const [addingCard, setAddingCard] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingDeck, setEditingDeck] = useState(false);
  const [studyMode, setStudyMode] = useState(null); // null | 'due' | 'all'

  const deckCards = useMemo(() => cardsForDeck(cards, deck.id), [cards, deck.id]);
  const stats = useMemo(() => deckStats(cards, deck.id), [cards, deck.id]);
  const dueCards = useMemo(() => dueCardsForDeck(cards, deck.id), [cards, deck.id]);

  if (studyMode) {
    const queue = studyMode === "due" ? dueCards : deckCards;
    return <StudySession deck={deck} cards={queue} onClose={() => setStudyMode(null)} />;
  }

  return (
    <div className="view-pane">
      <div className="deck-detail-header">
        <button className="btn-ghost" onClick={onBack}>
          ← Decks
        </button>
        <div className="deck-detail-title">
          <span className="subject-dot" style={{ background: deck.color }} />
          <h2>{deck.name}</h2>
        </div>
        <button className="btn-ghost" onClick={() => setEditingDeck(true)}>
          Edit deck
        </button>
      </div>
      {deck.description && <p className="deck-detail-desc">{deck.description}</p>}

      <div className="progress-summary">
        <div className="progress-stat">
          <span className="progress-stat-value">{stats.due}</span>
          <span className="progress-stat-label">due now</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">{stats.new}</span>
          <span className="progress-stat-label">new</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">{stats.learning}</span>
          <span className="progress-stat-label">learning</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">{stats.review}</span>
          <span className="progress-stat-label">review</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">{stats.mastered}</span>
          <span className="progress-stat-label">mastered</span>
        </div>
      </div>

      <div className="view-toolbar">
        <button className="btn-primary" disabled={dueCards.length === 0} onClick={() => setStudyMode("due")}>
          Study now {dueCards.length > 0 ? `(${dueCards.length} due)` : ""}
        </button>
        {deckCards.length > 0 && (
          <button className="btn-ghost" onClick={() => setStudyMode("all")}>
            Study all cards
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn-ghost" onClick={() => setImporting(true)}>
          Upload / import
        </button>
        <button className="btn-ghost" onClick={() => setAddingCard(true)}>
          + Add card
        </button>
      </div>

      {deckCards.length === 0 ? (
        <p className="empty-hint">
          No cards yet. Upload a file (CSV, TSV, JSON, or plain text) or add cards manually to get started.
        </p>
      ) : (
        <div className="card-list">
          {deckCards.map((card) => (
            <div key={card.id} className="card-row">
              <button className="card-row-main" onClick={() => setEditingCard(card)}>
                <span className="card-row-front">{card.front}</span>
                <span className="card-row-back">{card.back}</span>
              </button>
              <div className="card-row-meta">
                <span className={`status-pill status-${card.status || "new"}`}>{card.status || "new"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {addingCard && <CardModal deckId={deck.id} onClose={() => setAddingCard(false)} />}
      {editingCard && <CardModal deckId={deck.id} card={editingCard} onClose={() => setEditingCard(null)} />}
      {importing && <ImportModal deckId={deck.id} onClose={() => setImporting(false)} />}
      {editingDeck && (
        <DeckModal deck={deck} onClose={() => setEditingDeck(false)} onDeleted={onBack} />
      )}
    </div>
  );
}
