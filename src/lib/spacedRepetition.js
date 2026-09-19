// A simplified SM-2 (SuperMemo 2) spaced-repetition scheduler, the same family of
// algorithm used by Anki and most flashcard apps. Four-button rating like Anki's,
// rather than SM-2's original 0-5 quality scale.
import { addDaysToStr, todayStr } from "./dateUtils";

export const RATING = { AGAIN: "again", HARD: "hard", GOOD: "good", EASY: "easy" };

export const RATING_LABELS = {
  [RATING.AGAIN]: "Again",
  [RATING.HARD]: "Hard",
  [RATING.GOOD]: "Good",
  [RATING.EASY]: "Easy",
};

const MIN_EASE = 1.3;
const MASTERED_INTERVAL_DAYS = 21;

export function initCardProgress() {
  return {
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    dueDate: null, // null = new / due now
    lastReviewed: null,
    status: "new", // 'new' | 'learning' | 'review' | 'mastered'
  };
}

// Returns the patch to apply to a card after reviewing it with the given rating.
export function scheduleReview(card, rating, today = todayStr()) {
  let ease = card.ease ?? 2.5;
  let interval = card.interval ?? 0;
  let reps = card.reps ?? 0;
  let lapses = card.lapses ?? 0;

  if (rating === RATING.AGAIN) {
    lapses += 1;
    reps = 0;
    ease = Math.max(MIN_EASE, ease - 0.2);
    interval = 0; // due again today/next session
  } else {
    reps += 1;
    if (reps === 1) {
      interval = 1;
    } else if (reps === 2) {
      interval = 6;
    } else if (rating === RATING.HARD) {
      interval = Math.max(1, Math.round(interval * 1.2));
    } else if (rating === RATING.EASY) {
      interval = Math.max(1, Math.round(interval * (ease + 0.15)));
    } else {
      interval = Math.max(1, Math.round(interval * ease));
    }

    if (rating === RATING.HARD) ease = Math.max(MIN_EASE, ease - 0.15);
    if (rating === RATING.EASY) ease = ease + 0.15;
  }

  const dueDate = interval > 0 ? addDaysToStr(today, interval) : today;
  const status =
    rating === RATING.AGAIN
      ? "learning"
      : reps <= 1
        ? "learning"
        : interval >= MASTERED_INTERVAL_DAYS
          ? "mastered"
          : "review";

  return { ease, interval, reps, lapses, dueDate, lastReviewed: today, status };
}

export function isDue(card, today = todayStr()) {
  if (!card.dueDate) return true;
  return card.dueDate <= today;
}
