# Planner

A personal schedule and revision planner for students: a weekly calendar,
a revision planner that suggests study blocks around your fixed
commitments, exercise/personal-time targets, deadline reminders,
rule-based daily tips, and a checklist. Everything runs entirely in your
browser — no backend, no account, no data leaving your machine except
when you explicitly export a backup or sync from Outlook.

## Features

- **Calendar** — Today and Week views, with fixed events (lectures, work,
  social, other) that can repeat weekly on chosen weekdays.
- **Deadlines** — assignments and exams per subject, with dismissible
  in-app "due soon" banners and optional browser notifications.
- **Revision planner** — set a weekly study-hour target per subject, log
  hours actually studied, and get auto-suggested study blocks that fit
  your genuinely free time, prioritizing subjects with closer deadlines.
  Suggestions can be accepted, moved, or deleted.
- **Exercise & personal time** — weekly targets (e.g. 3 workouts, 1 free
  evening) tracked the same way, with a quick-add shortcut.
- **Daily tips** — a small rule-based panel on the Today view flags things
  like an overloaded day, a deadline with too little time planned, or a
  week with no exercise or rest time scheduled.
- **Checklist** — tasks you can tick off, optionally linked to an upcoming
  calendar event, with a "done this week" count and a day streak.
- **Flashcards** — upload or type flashcards into decks, then revise them
  with a spaced-repetition study mode (a simplified SM-2 algorithm, the
  same family Anki uses) that reschedules each card based on how well you
  knew it, so you spend more time on the cards you're about to forget.
  Tracks per-deck progress (new/learning/review/mastered counts, cards due
  today) and an overall review streak.
- **Outlook sync** — pull your Outlook calendar in as read-only busy time
  the planner schedules around (see [Outlook sync](#outlook-calendar-sync)
  below for how, and its limits).
- **Dark / light / system theme**, mobile-friendly layout, and JSON
  export/import for backups.

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173). All data is saved
automatically to your browser's `localStorage` as you use the app — there's
nothing to configure to get started.

### Building for production

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally to sanity-check it
```

## Data & backups

Everything lives in this browser's `localStorage` under one key. That means:

- Your data doesn't sync between devices or browsers on its own.
- Clearing site data / browser storage will erase it.
- Go to **Settings → Backup & restore** to export a JSON snapshot of
  everything (events, subjects, deadlines, checklist, settings) or import
  one back in. Importing **replaces** all current data, so export first if
  you want to keep what's there.

## Outlook calendar sync

Since this app has no backend, Outlook sync works by importing an
**ICS (iCalendar)** feed rather than logging into Microsoft:

1. In Outlook, use **Share calendar → Publish a calendar** (or the
   equivalent "Publish to web" flow) to get an ICS link.
2. In this app, go to **Settings → Outlook calendar sync**, paste that URL,
   and click **Sync now**.
3. Most Outlook publish links don't allow the browser to fetch them
   directly (a CORS restriction Outlook's server applies, not something
   this app can bypass without a backend). If that happens you'll see a
   clear error — just download the `.ics` file from that same Outlook link
   in a new tab and either **upload the file** or **paste its contents**
   into the box below; both use the same importer.

Imported events show up as locked, read-only blocks on the calendar (you
can't edit or delete them individually — re-sync to refresh, which
replaces the previous Outlook import). The revision planner schedules
study suggestions around them like any other busy time.

**Limitations:** the ICS parser supports simple weekly/daily recurring
events and one-off events, UTC (`Z`) times, and all-day events. It doesn't
resolve named time zones (`TZID=...`) — those are treated as local
wall-clock time — and it doesn't support recurrence exceptions (`EXDATE`)
or non-weekly/daily recurrence rules (e.g. monthly). This covers the
common case of a recurring class/work schedule plus one-off meetings; more
exotic recurring events may need to be added manually.

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and deploys the app on
every push to `main` (or `claude/student-schedule-planner-ail0ar`, the
branch this was developed on). To turn it on:

1. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
2. Push to one of the branches above (or run the workflow manually from
   the **Actions** tab).
3. The deployed URL will be shown in the workflow run and under
   **Settings → Pages** once it finishes.

`vite.config.js` sets the build's base path to `/timetable-/` to match a
GitHub Pages project site for this repo; `npm run dev` still runs at the
root locally.

## Project structure

```
src/
  lib/          date/recurrence/scheduler/ICS-parsing logic, no React
  store/        localStorage-backed React context + reducer
  components/
    Calendar/   Today/Week grid, event create/edit
    Deadlines/  deadlines + subjects
    Planner/    revision planner, suggestions, exercise/personal targets
    Checklist/  tasks + progress
    Flashcards/ decks, cards, upload/import, spaced-repetition study mode
    Suggestions/ rule-based daily tips
    Settings/   theme, backup, Outlook sync
    Banner/     in-app due-soon banners
```

## Development history

Built in stages, each committed separately:

1. Calendar core — Today/Week views, fixed and recurring events
2. Deadlines list, subjects, and reminders (banners + browser notifications)
3. Revision planner — subject hour targets, study logging, auto-suggested
   study blocks
4. Exercise/personal targets, rule-based daily tips, checklist
5. Outlook sync, JSON export/import, theming, GitHub Pages deploy
