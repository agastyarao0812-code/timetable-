import { useState } from "react";
import { usePlannerActions, usePlannerState } from "./store/PlannerContext";
import TodayView from "./components/Calendar/TodayView";
import WeekView from "./components/Calendar/WeekView";

const TABS = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
];

export default function App() {
  const { settings } = usePlannerState();
  const actions = usePlannerActions();
  const [tab, setTab] = useState("today");

  const toggleTheme = () => {
    actions.updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

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

      <main className="app-main">
        {tab === "today" && <TodayView />}
        {tab === "week" && <WeekView />}
      </main>
    </div>
  );
}
