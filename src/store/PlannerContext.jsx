import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadData, saveData } from "../lib/storage";
import { makeId } from "../lib/id";
import { todayStr } from "../lib/dateUtils";
import { initCardProgress, scheduleReview } from "../lib/spacedRepetition";

const PlannerStateContext = createContext(null);
const PlannerDispatchContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "SET_ALL":
      return action.data;

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.category] };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      };
    case "DELETE_CATEGORY":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.id) };

    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.event] };
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)),
      };
    case "DELETE_EVENT":
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };
    case "DELETE_EVENTS_BY_SOURCE":
      return { ...state, events: state.events.filter((e) => e.source !== action.source) };
    case "ADD_EVENTS_BULK":
      return { ...state, events: [...state.events, ...action.events] };
    case "SET_EVENT_EXCEPTION":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.eventId
            ? { ...e, exceptions: { ...e.exceptions, [action.anchorDate]: action.exception } }
            : e
        ),
      };

    case "ADD_SUBJECT":
      return { ...state, subjects: [...state.subjects, action.subject] };
    case "UPDATE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      };
    case "DELETE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.filter((s) => s.id !== action.id),
        events: state.events.filter((e) => e.subjectId !== action.id),
        deadlines: state.deadlines.filter((d) => d.subjectId !== action.id),
      };
    case "LOG_STUDY_HOURS":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.id
            ? { ...s, studyLog: { ...s.studyLog, [action.date]: action.hours } }
            : s
        ),
      };

    case "ADD_DEADLINE":
      return { ...state, deadlines: [...state.deadlines, action.deadline] };
    case "UPDATE_DEADLINE":
      return {
        ...state,
        deadlines: state.deadlines.map((d) => (d.id === action.id ? { ...d, ...action.patch } : d)),
      };
    case "DELETE_DEADLINE":
      return { ...state, deadlines: state.deadlines.filter((d) => d.id !== action.id) };

    case "UPDATE_TARGETS":
      return { ...state, targets: { ...state.targets, ...action.patch } };

    case "ADD_TASK":
      return { ...state, checklist: [...state.checklist, action.task] };
    case "UPDATE_TASK":
      return {
        ...state,
        checklist: state.checklist.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };
    case "DELETE_TASK":
      return { ...state, checklist: state.checklist.filter((t) => t.id !== action.id) };

    case "ADD_DECK":
      return { ...state, decks: [...state.decks, action.deck] };
    case "UPDATE_DECK":
      return {
        ...state,
        decks: state.decks.map((d) => (d.id === action.id ? { ...d, ...action.patch } : d)),
      };
    case "DELETE_DECK":
      return {
        ...state,
        decks: state.decks.filter((d) => d.id !== action.id),
        cards: state.cards.filter((c) => c.deckId !== action.id),
      };

    case "ADD_CARD":
      return { ...state, cards: [...state.cards, action.card] };
    case "ADD_CARDS_BULK":
      return { ...state, cards: [...state.cards, ...action.cards] };
    case "UPDATE_CARD":
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      };
    case "DELETE_CARD":
      return { ...state, cards: state.cards.filter((c) => c.id !== action.id) };
    case "REVIEW_CARD": {
      const today = todayStr();
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
        flashcardReviewLog: {
          ...state.flashcardReviewLog,
          [today]: (state.flashcardReviewLog[today] || 0) + 1,
        },
      };
    }

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export function PlannerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadData);

  useEffect(() => {
    saveData(state);
  }, [state]);

  return (
    <PlannerStateContext.Provider value={state}>
      <PlannerDispatchContext.Provider value={dispatch}>{children}</PlannerDispatchContext.Provider>
    </PlannerStateContext.Provider>
  );
}

export function usePlannerState() {
  const ctx = useContext(PlannerStateContext);
  if (!ctx) throw new Error("usePlannerState must be used within PlannerProvider");
  return ctx;
}

export function usePlannerDispatch() {
  const ctx = useContext(PlannerDispatchContext);
  if (!ctx) throw new Error("usePlannerDispatch must be used within PlannerProvider");
  return ctx;
}

// Convenience action creators bundled into one hook.
export function usePlannerActions() {
  const dispatch = usePlannerDispatch();
  return useMemo(
    () => ({
      setAll: (data) => dispatch({ type: "SET_ALL", data }),
      updateSettings: (patch) => dispatch({ type: "UPDATE_SETTINGS", patch }),

      addCategory: (category) => dispatch({ type: "ADD_CATEGORY", category: { id: makeId(), ...category } }),
      updateCategory: (id, patch) => dispatch({ type: "UPDATE_CATEGORY", id, patch }),
      deleteCategory: (id) => dispatch({ type: "DELETE_CATEGORY", id }),

      addEvent: (event) => dispatch({ type: "ADD_EVENT", event }),
      addEventsBulk: (events) => dispatch({ type: "ADD_EVENTS_BULK", events }),
      updateEvent: (id, patch) => dispatch({ type: "UPDATE_EVENT", id, patch }),
      deleteEvent: (id) => dispatch({ type: "DELETE_EVENT", id }),
      deleteEventsBySource: (source) => dispatch({ type: "DELETE_EVENTS_BY_SOURCE", source }),
      setEventException: (eventId, anchorDate, exception) =>
        dispatch({ type: "SET_EVENT_EXCEPTION", eventId, anchorDate, exception }),

      addSubject: (subject) => dispatch({ type: "ADD_SUBJECT", subject: { id: makeId(), studyLog: {}, ...subject } }),
      updateSubject: (id, patch) => dispatch({ type: "UPDATE_SUBJECT", id, patch }),
      deleteSubject: (id) => dispatch({ type: "DELETE_SUBJECT", id }),
      logStudyHours: (id, date, hours) => dispatch({ type: "LOG_STUDY_HOURS", id, date, hours }),

      addDeadline: (deadline) => dispatch({ type: "ADD_DEADLINE", deadline: { id: makeId(), ...deadline } }),
      updateDeadline: (id, patch) => dispatch({ type: "UPDATE_DEADLINE", id, patch }),
      deleteDeadline: (id) => dispatch({ type: "DELETE_DEADLINE", id }),

      updateTargets: (patch) => dispatch({ type: "UPDATE_TARGETS", patch }),

      addTask: (task) => dispatch({ type: "ADD_TASK", task: { id: makeId(), done: false, createdAt: Date.now(), ...task } }),
      updateTask: (id, patch) => dispatch({ type: "UPDATE_TASK", id, patch }),
      deleteTask: (id) => dispatch({ type: "DELETE_TASK", id }),

      addDeck: (deck) => {
        const id = makeId();
        dispatch({ type: "ADD_DECK", deck: { id, createdAt: Date.now(), ...deck } });
        return id;
      },
      updateDeck: (id, patch) => dispatch({ type: "UPDATE_DECK", id, patch }),
      deleteDeck: (id) => dispatch({ type: "DELETE_DECK", id }),

      addCard: (card) =>
        dispatch({ type: "ADD_CARD", card: { id: makeId(), createdAt: Date.now(), ...initCardProgress(), ...card } }),
      addCardsBulk: (cards) =>
        dispatch({
          type: "ADD_CARDS_BULK",
          cards: cards.map((c) => ({ id: makeId(), createdAt: Date.now(), ...initCardProgress(), ...c })),
        }),
      updateCard: (id, patch) => dispatch({ type: "UPDATE_CARD", id, patch }),
      deleteCard: (id) => dispatch({ type: "DELETE_CARD", id }),
      reviewCard: (card, rating) => dispatch({ type: "REVIEW_CARD", id: card.id, patch: scheduleReview(card, rating) }),
    }),
    [dispatch]
  );
}
