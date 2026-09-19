import { useMemo, useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { addDays, formatMonthYear, getWeekDates, minutesToLabel, todayStr } from "../../lib/dateUtils";
import { generateStudySuggestions, getWeekStatsForSubjects } from "../../lib/scheduler";
import { getOccurrencesForEvents } from "../../lib/recurrence";
import SuggestionModal from "./SuggestionModal";
import "./planner.css";

export default function PlannerView() {
  const { subjects, deadlines, events, settings } = usePlannerState();
  const actions = usePlannerActions();
  const [anchor, setAnchor] = useState(new Date());
  const [logDate, setLogDate] = useState(todayStr());
  const [activeSuggestion, setActiveSuggestion] = useState(null);

  const days = useMemo(() => getWeekDates(anchor, settings.weekStartsOn), [anchor, settings.weekStartsOn]);

  const stats = useMemo(() => getWeekStatsForSubjects(subjects, deadlines, events, days), [subjects, deadlines, events, days]);

  const weekSuggestions = useMemo(() => {
    const suggested = events.filter((e) => e.status === "suggested" && e.type === "study");
    return getOccurrencesForEvents(suggested, days[0], days[days.length - 1]).sort((a, b) =>
      a.date === b.date ? a.startMinutes - b.startMinutes : a.date < b.date ? -1 : 1
    );
  }, [events, days]);

  const subjectsById = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);

  const handleGenerate = () => {
    const existingWeekSuggestionIds = weekSuggestions.map((o) => o.eventId);
    for (const id of existingWeekSuggestionIds) actions.deleteEvent(id);

    const newSuggestions = generateStudySuggestions({ subjects, deadlines, events, settings, days });
    if (newSuggestions.length) actions.addEventsBulk(newSuggestions);
  };

  const handleAccept = (occ) => {
    actions.updateEvent(occ.eventId, { status: "confirmed" });
  };

  const handleReject = (occ) => {
    actions.deleteEvent(occ.eventId);
  };

  const adjustLog = (subject, delta) => {
    const current = subject.studyLog[logDate] || 0;
    const next = Math.max(0, Math.round((current + delta) * 2) / 2);
    actions.logStudyHours(subject.id, logDate, next);
  };

  if (subjects.length === 0) {
    return (
      <div className="view-pane">
        <div className="view-toolbar">
          <h2 className="toolbar-title">Revision planner</h2>
        </div>
        <p className="empty-hint">
          Add a subject first (with a weekly study-hour target) from the Deadlines tab, then come back here to get
          study block suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="view-pane">
      <div className="view-toolbar">
        <div className="toolbar-group">
          <button className="btn-ghost" onClick={() => setAnchor((d) => addDays(d, -7))}>
            ← Prev
          </button>
          <button className="btn-ghost" onClick={() => setAnchor(new Date())}>
            This week
          </button>
          <button className="btn-ghost" onClick={() => setAnchor((d) => addDays(d, 7))}>
            Next →
          </button>
        </div>
        <h2 className="toolbar-title">{formatMonthYear(days[0])}</h2>
        <button className="btn-primary" onClick={handleGenerate}>
          Suggest study blocks
        </button>
      </div>

      <section className="planner-section">
        <h3>This week's subjects</h3>
        <div className="subject-stats">
          {stats.map(({ subject, targetHours, loggedHours, scheduledHours, remainingHours, daysUntilDeadline }) => {
            const pct = targetHours > 0 ? Math.min(100, ((loggedHours + scheduledHours) / targetHours) * 100) : 0;
            const loggedPct = targetHours > 0 ? Math.min(100, (loggedHours / targetHours) * 100) : 0;
            return (
              <div key={subject.id} className="subject-stat-row">
                <div className="subject-stat-head">
                  <span className="subject-dot" style={{ background: subject.color }} />
                  <span className="subject-stat-name">{subject.name}</span>
                  {daysUntilDeadline !== undefined && (
                    <span className="subject-deadline-pill">
                      {daysUntilDeadline === 0 ? "due today" : `due in ${daysUntilDeadline}d`}
                    </span>
                  )}
                  <span className="subject-stat-hours">
                    {loggedHours}h logged + {scheduledHours}h planned / {targetHours}h target
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: subject.color }} />
                  <div className="progress-fill-solid" style={{ width: `${loggedPct}%`, background: subject.color }} />
                </div>
                {remainingHours > 0 && (
                  <span className="subject-remaining">{remainingHours}h still needed this week</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="planner-section">
        <div className="planner-section-head">
          <h3>Log study hours</h3>
          <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="log-date-input" />
        </div>
        <div className="log-grid">
          {subjects.map((s) => (
            <div key={s.id} className="log-row">
              <span className="subject-dot" style={{ background: s.color }} />
              <span className="log-name">{s.name}</span>
              <button className="btn-ghost" onClick={() => adjustLog(s, -0.5)}>
                −
              </button>
              <span className="log-value">{s.studyLog[logDate] || 0}h</span>
              <button className="btn-ghost" onClick={() => adjustLog(s, 0.5)}>
                +
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="planner-section">
        <h3>Suggested blocks this week</h3>
        {weekSuggestions.length === 0 ? (
          <p className="empty-hint">
            No suggestions yet. Click <strong>Suggest study blocks</strong> above to fill your free time based on
            each subject's weekly target and closest deadline.
          </p>
        ) : (
          <div className="suggestion-list">
            {weekSuggestions.map((occ) => {
              const subject = subjectsById[occ.event.subjectId];
              return (
                <div key={occ.occurrenceId} className="suggestion-row" onClick={() => setActiveSuggestion(occ)}>
                  <span className="subject-dot" style={{ background: subject?.color }} />
                  <span className="suggestion-row-main">
                    <strong>{subject?.name}</strong>
                    <span className="suggestion-row-meta">
                      {occ.date} · {minutesToLabel(occ.startMinutes)} · {occ.durationMinutes} min
                    </span>
                  </span>
                  <button
                    className="btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(occ);
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-danger-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(occ);
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {activeSuggestion && <SuggestionModal occurrence={activeSuggestion} onClose={() => setActiveSuggestion(null)} />}
    </div>
  );
}
