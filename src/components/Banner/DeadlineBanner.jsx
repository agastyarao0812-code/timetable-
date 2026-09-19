import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { daysUntil, getBannerDeadlines, urgencyLabel } from "../../lib/deadlineUtils";
import { todayStr } from "../../lib/dateUtils";
import "./banner.css";

export default function DeadlineBanner() {
  const { deadlines, subjects, settings } = usePlannerState();
  const actions = usePlannerActions();

  const banners = getBannerDeadlines(deadlines, settings.bannerThresholdDays, settings.dismissedBanners);
  if (banners.length === 0) return null;

  const subjectsById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const dismiss = (id) => {
    actions.updateSettings({ dismissedBanners: { ...settings.dismissedBanners, [id]: todayStr() } });
  };

  return (
    <div className="banner-stack">
      {banners.map((d) => {
        const days = daysUntil(d.dueDate);
        const subject = subjectsById[d.subjectId];
        return (
          <div key={d.id} className={`banner ${days < 0 ? "banner-overdue" : days === 0 ? "banner-today" : "banner-soon"}`}>
            <span className="banner-text">
              <strong>{d.title}</strong>
              {subject ? ` (${subject.name})` : ""} — {urgencyLabel(days)}
            </span>
            <button className="banner-dismiss" onClick={() => dismiss(d.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
