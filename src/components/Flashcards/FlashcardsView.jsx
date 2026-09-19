import { useMemo, useState } from "react";
import { usePlannerState } from "../../store/PlannerContext";
import { deckStats, getReviewStreak, totalReviewsToday } from "../../lib/flashcardUtils";
import DeckModal from "./DeckModal";
import DeckDetail from "./DeckDetail";
import "./flashcards.css";

export default function FlashcardsView() {
  const { decks, cards, flashcardReviewLog } = usePlannerState();
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState(null);

  const streak = useMemo(() => getReviewStreak(flashcardReviewLog), [flashcardReviewLog]);
  const reviewsToday = useMemo(() => totalReviewsToday(flashcardReviewLog), [flashcardReviewLog]);
  const totalDue = useMemo(
    () => decks.reduce((sum, d) => sum + deckStats(cards, d.id).due, 0),
    [decks, cards]
  );

  const activeDeck = activeDeckId ? decks.find((d) => d.id === activeDeckId) : null;

  if (activeDeck) {
    return <DeckDetail deck={activeDeck} onBack={() => setActiveDeckId(null)} />;
  }

  return (
    <div className="view-pane">
      <div className="view-toolbar">
        <h2 className="toolbar-title">Flashcards</h2>
        <button className="btn-primary" onClick={() => setCreatingDeck(true)}>
          + New deck
        </button>
      </div>

      <div className="progress-summary">
        <div className="progress-stat">
          <span className="progress-stat-value">{totalDue}</span>
          <span className="progress-stat-label">cards due</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">{reviewsToday}</span>
          <span className="progress-stat-label">reviewed today</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">🔥 {streak}</span>
          <span className="progress-stat-label">day streak</span>
        </div>
      </div>

      {decks.length === 0 ? (
        <p className="empty-hint">
          No decks yet. Create a deck, then upload flashcards (CSV, TSV, JSON, or plain text) or add them one by
          one. Reviewing schedules each card for spaced repetition, so you focus on the ones you're about to
          forget.
        </p>
      ) : (
        <div className="deck-grid">
          {decks.map((deck) => {
            const stats = deckStats(cards, deck.id);
            return (
              <button
                key={deck.id}
                className="deck-card"
                style={{ "--deck-color": deck.color }}
                onClick={() => setActiveDeckId(deck.id)}
              >
                <span className="deck-card-name">{deck.name}</span>
                {deck.description && <span className="deck-card-desc">{deck.description}</span>}
                <span className="deck-card-stats">
                  <span>{stats.total} cards</span>
                  <span className={stats.due > 0 ? "deck-card-due" : "deck-card-due-zero"}>
                    {stats.due > 0 ? `${stats.due} due` : "all caught up"}
                  </span>
                  <span>{stats.mastered} mastered</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {creatingDeck && (
        <DeckModal onClose={() => setCreatingDeck(false)} onCreated={(id) => setActiveDeckId(id)} />
      )}
    </div>
  );
}
