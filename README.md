# Planner

A personal schedule and revision planner for students. Weekly calendar,
revision planning around deadlines, exercise/personal-time targets, and a
checklist — all stored locally in your browser (no backend, no accounts).

This project is being built in stages. Current status:

- [x] Stage 1: Weekly calendar + Today view, fixed events, recurring events
- [x] Stage 2: Deadlines list + reminders
- [ ] Stage 3: Revision planner (subjects, auto-suggested study blocks)
- [ ] Stage 4: Exercise/personal targets, daily suggestions, checklist
- [ ] Stage 5: Outlook sync, JSON export/import, theming polish, GitHub Pages deploy

## Running it locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## What to test right now (Stage 1)

- Switch between the **Today** and **Week** tabs.
- Click any empty slot on the grid to add an event (title, category, date,
  start time, duration).
- Tick **Repeats weekly** and pick one or more weekdays to create a
  recurring event — it will appear on every matching day from its start
  date onward.
- Click an existing event to edit it. For recurring events you can:
  - change the whole series,
  - check **Only change this occurrence** to move/resize just one instance,
  - delete just one occurrence, or delete the whole series.
- Toggle dark/light mode with the button in the top-right.
- Refresh the page — everything is saved automatically to your browser's
  local storage.

## What to test right now (Stage 2)

- Go to the **Deadlines** tab.
- Click **+ Subject** to add a subject (name, color, and a target study
  hours/week — the hours field will be used once the revision planner
  lands in Stage 3). Click an existing subject chip to edit or delete it.
- Click **+ Add deadline** to add an assignment or exam: title, type,
  subject, due date, notes. Click a row to edit or delete it.
- Deadlines due today or within the next few days get a colored "due
  soon" badge, and show up as a dismissible banner at the top of every
  tab. Dismissing a banner hides it for the rest of the day.
- Click **Enable notifications** and allow the browser prompt — you'll
  then get an OS-level notification when a deadline is 3 days out, 1 day
  out, and on the due date itself (checked on load and every 30 minutes
  while a tab stays open).

## Building for production

```bash
npm run build
npm run preview   # serve the production build locally to sanity-check it
```
