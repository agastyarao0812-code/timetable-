# Planner

A personal schedule and revision planner for students. Weekly calendar,
revision planning around deadlines, exercise/personal-time targets, and a
checklist — all stored locally in your browser (no backend, no accounts).

This project is being built in stages. Current status:

- [x] Stage 1: Weekly calendar + Today view, fixed events, recurring events
- [ ] Stage 2: Deadlines list + reminders
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

## Building for production

```bash
npm run build
npm run preview   # serve the production build locally to sanity-check it
```
