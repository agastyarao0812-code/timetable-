import { useState } from "react";
import { usePlannerActions } from "../../store/PlannerContext";
import { RATING, RATING_LABELS } from "../../lib/spacedRepetition";

export default function StudySession({ deck, cards, onClose }) {
  const actions = usePlannerActions();
  // Snapshot the queue at session start so it doesn't reshuffle mid-session as cards update.
  const [queue] = useState(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState({ [RATING.AGAIN]: 0, [RATING.HARD]: 0, [RATING.GOOD]: 0, [RATING.EASY]: 0 });

  const current = queue[index];
  const done = index >= queue.length;

  const handleRate = (rating) => {
    actions.reviewCard(current, rating);
    setTally((t) => ({ ...t, [rating]: t[rating] + 1 }));
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  if (queue.length === 0) {
    return (
      <div className="study-session">
        <p className="empty-hint">No cards are due in this deck right now. Nice work!</p>
        <button className="btn-primary" onClick={onClose}>
          Back to deck
        </button>
      </div>
    );
  }

  if (done) {
    const reviewed = queue.length;
    return (
      <div className="study-summary">
        <h3>Session complete</h3>
        <p className="empty-hint">
          Reviewed {reviewed} card{reviewed === 1 ? "" : "s"} in <strong>{deck.name}</strong>.
        </p>
        <div className="progress-summary">
          {Object.values(RATING).map((r) => (
            <div className="progress-stat" key={r}>
              <span className="progress-stat-value">{tally[r]}</span>
              <span className="progress-stat-label">{RATING_LABELS[r]}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={onClose}>
          Back to deck
        </button>
      </div>
    );
  }

  return (
    <div className="study-session">
      <div className="study-progress">
        <span>
          {index + 1} / {queue.length}
        </span>
        <div className="study-progress-track">
          <div className="study-progress-fill" style={{ width: `${(index / queue.length) * 100}%` }} />
        </div>
      </div>

      <div className={`study-card ${revealed ? "study-card-back" : ""}`} onClick={() => setRevealed((r) => !r)}>
        {revealed ? current.back : current.front}
      </div>
      <p className="study-card-hint">{revealed ? "How well did you know it?" : "Click the card to reveal the answer"}</p>

      {revealed && (
        <div className="study-ratings">
          <button className="rating-btn rating-again" onClick={() => handleRate(RATING.AGAIN)}>
            Again
          </button>
          <button className="rating-btn rating-hard" onClick={() => handleRate(RATING.HARD)}>
            Hard
          </button>
          <button className="rating-btn rating-good" onClick={() => handleRate(RATING.GOOD)}>
            Good
          </button>
          <button className="rating-btn rating-easy" onClick={() => handleRate(RATING.EASY)}>
            Easy
          </button>
        </div>
      )}

      <button className="btn-ghost" onClick={onClose}>
        End session
      </button>
    </div>
  );
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
