import { addDaysToStr, todayStr } from "./dateUtils";
import { isDue } from "./spacedRepetition";

export function cardsForDeck(cards, deckId) {
  return cards.filter((c) => c.deckId === deckId);
}

export function deckStats(cards, deckId, today = todayStr()) {
  const deckCards = cardsForDeck(cards, deckId);
  const stats = { total: deckCards.length, new: 0, learning: 0, review: 0, mastered: 0, due: 0 };
  for (const card of deckCards) {
    stats[card.status || "new"] = (stats[card.status || "new"] || 0) + 1;
    if (isDue(card, today)) stats.due += 1;
  }
  return stats;
}

export function dueCardsForDeck(cards, deckId, today = todayStr()) {
  return cardsForDeck(cards, deckId).filter((c) => isDue(c, today));
}

// Consecutive days (ending today, or yesterday if nothing reviewed yet today) with at least one review logged.
export function getReviewStreak(reviewLog) {
  let cursor = todayStr();
  if (!reviewLog[cursor]) {
    cursor = addDaysToStr(cursor, -1);
  }
  let streak = 0;
  while (reviewLog[cursor]) {
    streak += 1;
    cursor = addDaysToStr(cursor, -1);
  }
  return streak;
}

export function totalReviewsToday(reviewLog) {
  return reviewLog[todayStr()] || 0;
}
