import { useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { daysUntil, sortByDueDate, urgencyLabel, urgencyLevel } from "../../lib/deadlineUtils";
import { getPermission, isNotificationSupported, requestNotificationPermission } from "../../lib/notifications";
import DeadlineModal from "./DeadlineModal";
import SubjectModal from "./SubjectModal";
import "./deadlines.css";

export default function DeadlinesView() {
  const { deadlines, subjects } = usePlannerState();
  const actions = usePlannerActions();
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [permission, setPermission] = useState(getPermission());

  const subjectsById = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const sorted = sortByDueDate(deadlines);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    actions.updateSettings({ notificationsEnabled: result === "granted" });
  };

  return (
    <div className="view-pane">
      <div className="view-toolbar">
        <h2 className="toolbar-title">Deadlines</h2>
        <button className="btn-primary" onClick={() => setShowDeadlineModal(true)}>
          + Add deadline
        </button>
      </div>

      <div className="subjects-row">
        {subjects.map((s) => (
          <button key={s.id} className="subject-chip" style={{ "--chip-color": s.color }} onClick={() => setEditingSubject(s)}>
            <span className="subject-dot" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
        <button className="btn-ghost" onClick={() => setShowSubjectModal(true)}>
          + Subject
        </button>
      </div>

      {isNotificationSupported() && permission !== "granted" && (
        <div className="notify-prompt">
          <span>Want a browser notification when deadlines are close?</span>
          <button className="btn-ghost" onClick={handleEnableNotifications}>
            {permission === "denied" ? "Notifications blocked in browser settings" : "Enable notifications"}
          </button>
        </div>
      )}

      {sorted.length === 0 && <p className="empty-hint">No deadlines yet. Add your first assignment or exam above.</p>}

      <div className="deadline-list">
        {sorted.map((d) => {
          const days = daysUntil(d.dueDate);
          const level = urgencyLevel(days);
          const subject = subjectsById[d.subjectId];
          return (
            <button key={d.id} className={`deadline-row urgency-${level}`} onClick={() => setEditingDeadline(d)}>
              <span className="deadline-dot" style={{ background: subject?.color || "var(--text-dim)" }} />
              <span className="deadline-main">
                <span className="deadline-title">{d.title}</span>
                <span className="deadline-meta">
                  {subject ? subject.name + " · " : ""}
                  {d.type === "exam" ? "Exam" : d.type === "other" ? "Other" : "Assignment"} · {d.dueDate}
                </span>
              </span>
              <span className={`deadline-badge badge-${level}`}>{urgencyLabel(days)}</span>
            </button>
          );
        })}
      </div>

      {showDeadlineModal && (
        <DeadlineModal onClose={() => setShowDeadlineModal(false)} onAddSubject={() => setShowSubjectModal(true)} />
      )}
      {editingDeadline && (
        <DeadlineModal
          deadline={editingDeadline}
          onClose={() => setEditingDeadline(null)}
          onAddSubject={() => setShowSubjectModal(true)}
        />
      )}
      {showSubjectModal && <SubjectModal onClose={() => setShowSubjectModal(false)} />}
      {editingSubject && <SubjectModal subject={editingSubject} onClose={() => setEditingSubject(null)} />}
    </div>
  );
}
