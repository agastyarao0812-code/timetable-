import { useRef, useState } from "react";
import { usePlannerActions, usePlannerState } from "../../store/PlannerContext";
import { exportDataToFile, importDataFromFile } from "../../lib/storage";
import { parseIcsToEvents } from "../../lib/icsParser";
import { fetchIcsFromUrl } from "../../lib/outlookSync";
import "./settings.css";

const THEME_OPTIONS = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "system", label: "Match system" },
];

export default function SettingsView() {
  const state = usePlannerState();
  const { settings } = state;
  const actions = usePlannerActions();

  const [icsUrl, setIcsUrl] = useState(settings.outlookIcsUrl || "");
  const [icsPaste, setIcsPaste] = useState("");
  const [syncStatus, setSyncStatus] = useState(null); // { type: 'ok'|'error', message }
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  const applyOutlookEvents = (icsText, sourceLabel) => {
    try {
      const parsed = parseIcsToEvents(icsText);
      actions.deleteEventsBySource("outlook");
      if (parsed.length) actions.addEventsBulk(parsed);
      actions.updateSettings({ lastOutlookSync: new Date().toISOString(), outlookIcsUrl: icsUrl });
      setSyncStatus({ type: "ok", message: `Imported ${parsed.length} event(s) from ${sourceLabel}.` });
    } catch (err) {
      setSyncStatus({ type: "error", message: `Couldn't parse that ICS data: ${err.message}` });
    }
  };

  const handleSyncFromUrl = async () => {
    if (!icsUrl.trim()) return;
    setSyncStatus({ type: "info", message: "Fetching..." });
    try {
      const text = await fetchIcsFromUrl(icsUrl.trim());
      applyOutlookEvents(text, "your Outlook calendar");
    } catch (err) {
      setSyncStatus({
        type: "error",
        message: `Direct fetch failed (${err.message}) — this is usually blocked by the browser's CORS policy for Outlook's publish links. Download the .ics file from Outlook instead and upload or paste it below.`,
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    applyOutlookEvents(text, file.name);
    e.target.value = "";
  };

  const handlePasteImport = () => {
    if (!icsPaste.trim()) return;
    applyOutlookEvents(icsPaste, "pasted text");
    setIcsPaste("");
  };

  const handleExport = () => {
    exportDataToFile(state);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("This will replace all current data with the contents of the backup file. Continue?")) {
      e.target.value = "";
      return;
    }
    try {
      const data = await importDataFromFile(file);
      actions.setAll(data);
    } catch (err) {
      alert(`Couldn't read that file: ${err.message}`);
    }
    e.target.value = "";
  };

  return (
    <div className="view-pane">
      <div className="view-toolbar">
        <h2 className="toolbar-title">Settings</h2>
      </div>

      <section className="planner-section">
        <h3>Appearance</h3>
        <div className="theme-options">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`chip ${settings.theme === opt.id ? "chip-active" : ""}`}
              onClick={() => actions.updateSettings({ theme: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="planner-section">
        <h3>Backup &amp; restore</h3>
        <p className="suggestion-hint">
          Everything is stored only in this browser. Export a backup regularly, or before clearing your
          browser data.
        </p>
        <div className="settings-actions">
          <button className="btn-ghost" onClick={handleExport}>
            Export JSON backup
          </button>
          <button className="btn-ghost" onClick={() => importInputRef.current?.click()}>
            Import JSON backup
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleImportFile}
          />
        </div>
      </section>

      <section className="planner-section">
        <h3>Outlook calendar sync</h3>
        <p className="suggestion-hint">
          Paste your Outlook <strong>Publish a calendar</strong> ICS link below. Outlook events import as
          read-only blocks the planner treats as busy time. Most Outlook links block direct browser
          fetches (CORS) — if that happens, download the .ics file from Outlook and upload or paste it
          instead; either way uses the same import.
        </p>
        <label>
          ICS URL
          <div className="preset-row">
            <input
              value={icsUrl}
              onChange={(e) => setIcsUrl(e.target.value)}
              placeholder="https://outlook.office365.com/owa/calendar/.../calendar.ics"
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={handleSyncFromUrl}>
              Sync now
            </button>
          </div>
        </label>

        <div className="settings-actions">
          <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
            Upload .ics file
          </button>
          <input ref={fileInputRef} type="file" accept=".ics,text/calendar" hidden onChange={handleFileUpload} />
        </div>

        <label>
          Or paste ICS text
          <textarea
            value={icsPaste}
            onChange={(e) => setIcsPaste(e.target.value)}
            rows={4}
            placeholder="BEGIN:VCALENDAR..."
          />
        </label>
        <button className="btn-ghost" style={{ alignSelf: "flex-start" }} onClick={handlePasteImport}>
          Import pasted ICS
        </button>

        {syncStatus && <p className={`sync-status sync-${syncStatus.type}`}>{syncStatus.message}</p>}
        {settings.lastOutlookSync && (
          <p className="suggestion-hint">Last synced: {new Date(settings.lastOutlookSync).toLocaleString()}</p>
        )}
      </section>
    </div>
  );
}
