import { makeId } from "./id";

export const STORAGE_KEY = "planner-data-v1";
export const SCHEMA_VERSION = 1;

// Fixed-event categories (editable colors, not deletable core set but user can add more).
export const DEFAULT_CATEGORIES = [
  { id: "cat-lecture", name: "Lectures", color: "#5b8def", kind: "fixed" },
  { id: "cat-work", name: "Work", color: "#e0954f", kind: "fixed" },
  { id: "cat-social", name: "Social", color: "#e35d9f", kind: "fixed" },
  { id: "cat-other", name: "Other", color: "#8f97a8", kind: "fixed" },
  { id: "cat-exercise", name: "Exercise", color: "#4caf7d", kind: "exercise" },
  { id: "cat-personal", name: "Personal time", color: "#3fb8c4", kind: "personal" },
  { id: "cat-outlook", name: "Outlook", color: "#6b6f8a", kind: "outlook" },
];

// Palette auto-assigned to new subjects, cycling.
export const SUBJECT_PALETTE = [
  "#c96bd6",
  "#f2b134",
  "#6bd6b3",
  "#f26d6d",
  "#6b9ff2",
  "#d6c96b",
  "#9f6bf2",
  "#6bf2d0",
  "#f2946b",
  "#6bc9f2",
];

export function nextSubjectColor(existingSubjects) {
  return SUBJECT_PALETTE[existingSubjects.length % SUBJECT_PALETTE.length];
}

export function createDefaultData() {
  return {
    version: SCHEMA_VERSION,
    settings: {
      theme: "dark",
      weekStartsOn: 1,
      dayStartHour: 5,
      dayEndHour: 24,
      slotMinutes: 30,
      notificationsEnabled: false,
      outlookIcsUrl: "",
      lastOutlookSync: null,
      bannerThresholdDays: 3,
      dismissedBanners: {},
      notifiedKeys: [],
    },
    categories: DEFAULT_CATEGORIES,
    events: [],
    subjects: [],
    deadlines: [],
    targets: {
      exercise: { perWeek: 3, durationMinutes: 60, categoryId: "cat-exercise" },
      personal: { perWeek: 1, durationMinutes: 120, categoryId: "cat-personal" },
    },
    checklist: [],
  };
}

export function makeDeadline(partial) {
  return {
    id: makeId(),
    title: "",
    subjectId: null,
    type: "assignment", // 'assignment' | 'exam' | 'other'
    dueDate: "",
    notes: "",
    ...partial,
  };
}

export function makeSubject(partial) {
  return {
    id: makeId(),
    name: "",
    color: "#6b9ff2",
    hoursPerWeek: 0,
    studyLog: {},
    ...partial,
  };
}

export function makeEvent(partial) {
  return {
    id: makeId(),
    title: "",
    categoryId: "cat-other",
    type: "fixed", // 'fixed' | 'study' | 'exercise' | 'personal' | 'outlook'
    subjectId: null,
    date: "",
    startMinutes: 9 * 60,
    durationMinutes: 60,
    recurrence: null, // { daysOfWeek: [1,3], until: null }
    exceptions: {},
    status: "confirmed", // 'confirmed' | 'suggested'
    notes: "",
    source: "user", // 'user' | 'outlook' | 'scheduler'
    locked: false,
    ...partial,
  };
}
