import { useMemo, useState } from "react";
import { usePlannerState } from "../../store/PlannerContext";
import { getOccurrencesForEvents } from "../../lib/recurrence";
import EventModal from "../Calendar/EventModal";
import TargetsModal from "./TargetsModal";

function TargetRow({ label, target, count, onQuickAdd }) {
  const pct = target.perWeek > 0 ? Math.min(100, (count / target.perWeek) * 100) : 0;
  return (
    <div className="subject-stat-row">
      <div className="subject-stat-head">
        <span className="subject-stat-name">{label}</span>
        <span className="subject-stat-hours">
          {count}/{target.perWeek} this week
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill-solid" style={{ width: `${pct}%`, background: "var(--accent)" }} />
      </div>
      <button className="btn-ghost" style={{ alignSelf: "flex-start" }} onClick={onQuickAdd}>
        + Quick add
      </button>
    </div>
  );
}

export default function TargetsSection() {
  const { targets, events } = usePlannerState();
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [quickAddCategory, setQuickAddCategory] = useState(null);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return [start, end];
  }, []);

  const exerciseCount = useMemo(() => {
    const matching = events.filter((e) => e.categoryId === targets.exercise.categoryId && e.status === "confirmed");
    return getOccurrencesForEvents(matching, days[0], days[1]).length;
  }, [events, targets.exercise.categoryId, days]);

  const personalCount = useMemo(() => {
    const matching = events.filter((e) => e.categoryId === targets.personal.categoryId && e.status === "confirmed");
    return getOccurrencesForEvents(matching, days[0], days[1]).length;
  }, [events, targets.personal.categoryId, days]);

  const todayStr = days[0].toISOString().slice(0, 10);

  return (
    <section className="planner-section">
      <div className="planner-section-head">
        <h3>Exercise &amp; personal time</h3>
        <button className="btn-ghost" onClick={() => setShowTargetsModal(true)}>
          Edit targets
        </button>
      </div>

      <div className="subject-stats">
        <TargetRow
          label="Exercise"
          target={targets.exercise}
          count={exerciseCount}
          onQuickAdd={() =>
            setQuickAddCategory({
              categoryId: targets.exercise.categoryId,
              durationMinutes: targets.exercise.durationMinutes,
            })
          }
        />
        <TargetRow
          label="Personal / rest time"
          target={targets.personal}
          count={personalCount}
          onQuickAdd={() =>
            setQuickAddCategory({
              categoryId: targets.personal.categoryId,
              durationMinutes: targets.personal.durationMinutes,
            })
          }
        />
      </div>

      {showTargetsModal && <TargetsModal onClose={() => setShowTargetsModal(false)} />}
      {quickAddCategory && (
        <EventModal
          mode="create"
          initial={{
            date: todayStr,
            startMinutes: 18 * 60,
            durationMinutes: quickAddCategory.durationMinutes,
            categoryId: quickAddCategory.categoryId,
          }}
          onClose={() => setQuickAddCategory(null)}
        />
      )}
    </section>
  );
}
