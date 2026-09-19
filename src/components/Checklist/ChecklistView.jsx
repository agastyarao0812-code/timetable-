import { useMemo, useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { getWeekDates, todayStr } from "../../lib/dateUtils";
import { countDoneThisWeek, getStreak, sortChecklist } from "../../lib/checklistUtils";
import { daysUntil } from "../../lib/deadlineUtils";
import TaskModal from "./TaskModal";
import "./checklist.css";

export default function ChecklistView() {
  const { checklist, events, settings } = usePlannerState();
  const actions = usePlannerActions();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const days = useMemo(() => getWeekDates(new Date(), settings.weekStartsOn), [settings.weekStartsOn]);
  const doneThisWeek = useMemo(() => countDoneThisWeek(checklist, days), [checklist, days]);
  const streak = useMemo(() => getStreak(checklist), [checklist]);
  const sorted = useMemo(() => sortChecklist(checklist), [checklist]);

  const eventsById = useMemo(() => Object.fromEntries(events.map((e) => [e.id, e])), [events]);

  const toggleTask = (task) => {
    actions.updateTask(task.id, {
      done: !task.done,
      doneAt: !task.done ? todayStr() : null,
    });
  };

  return (
    <div className="view-pane">
      <div className="view-toolbar">
        <h2 className="toolbar-title">Checklist</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add task
        </button>
      </div>

      <div className="progress-summary">
        <div className="progress-stat">
          <span className="progress-stat-value">{doneThisWeek}</span>
          <span className="progress-stat-label">done this week</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">🔥 {streak}</span>
          <span className="progress-stat-label">day streak</span>
        </div>
      </div>

      {sorted.length === 0 && <p className="empty-hint">No tasks yet. Add your first one above.</p>}

      <div className="task-list">
        {sorted.map((task) => {
          const linkedEvent = task.linkedEventId ? eventsById[task.linkedEventId] : null;
          const overdue = task.dueDate && !task.done && daysUntil(task.dueDate) < 0;
          return (
            <div key={task.id} className={`task-row ${task.done ? "task-done" : ""}`}>
              <input type="checkbox" checked={task.done} onChange={() => toggleTask(task)} />
              <button className="task-main" onClick={() => setEditingTask(task)}>
                <span className="task-text">{task.text}</span>
                <span className="task-meta">
                  {task.dueDate && <span className={overdue ? "task-overdue" : ""}>Due {task.dueDate}</span>}
                  {linkedEvent && <span className="task-linked">↳ {linkedEvent.title}</span>}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {showModal && <TaskModal onClose={() => setShowModal(false)} />}
      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </div>
  );
}
