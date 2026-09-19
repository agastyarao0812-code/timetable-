import { useEffect, useState } from "react";
import { usePlannerActions, usePlannerState } from "./store/PlannerContext";
import TodayView from "./components/Calendar/TodayView";
import WeekView from "./components/Calendar/WeekView";
import DeadlinesView from "./components/Deadlines/DeadlinesView";
import PlannerView from "./components/Planner/PlannerView";
import ChecklistView from "./components/Checklist/ChecklistView";
import DeadlineBanner from "./components/Banner/DeadlineBanner";
import { checkAndNotify } from "./lib/notifications";

const TABS = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "deadlines", label: "Deadlines" },
  { id: "planner", label: "Planner" },
  { id: "checklist", label: "Checklist" },
];

const NOTIFICATION_CHECK_INTERVAL_MS = 30 * 60 * 1000;

export default function App() {
  const { settings, deadlines } = usePlannerState();
  const actions = usePlannerActions();
  const [tab, setTab] = useState("today");

  const toggleTheme = () => {
    actions.updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

  useEffect(() => {
    checkAndNotify(deadlines, settings, actions.updateSettings);
    const interval = setInterval(() => {
      checkAndNotify(deadlines, settings, actions.updateSettings);
    }, NOTIFICATION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlines, settings.notificationsEnabled, settings.notifiedKeys]);

  return (
    <div className="app-shell" data-theme={settings.theme}>
      <header className="app-header">
        <div className="app-title">Planner</div>
        <nav className="app-nav">
          {TABS.map((t) => (
            <button key={t.id} className={`nav-btn ${tab === t.id ? "nav-btn-active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button className="btn-ghost theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {settings.theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <DeadlineBanner />

      <main className="app-main">
        {tab === "today" && <TodayView />}
        {tab === "week" && <WeekView />}
        {tab === "deadlines" && <DeadlinesView />}
        {tab === "planner" && <PlannerView />}
        {tab === "checklist" && <ChecklistView />}
      </main>
    </div>
  );
}
