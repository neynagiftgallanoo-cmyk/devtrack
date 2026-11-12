# DevTrack

A project, task, and deadline tracker for CS/IT students.
Stack: **Vite + React + TypeScript** on the frontend, **Supabase** (PostgreSQL, Auth, Realtime) on the backend.

## Run it

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The starter runs on
sample data saved in your browser's localStorage, so no account or database is
needed yet. Supabase is connected in Phase 2 of [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md).

To reset the sample data, clear the `devtrack:data:v1` key in DevTools → Application → Local Storage.

## What works in the starter

- Sidebar with the full project list (a bottom bar on phones), light/dark mode
- Project cards: create, edit, archive; tech-stack tags, status, priority, GitHub link, progress
- To-do list above the calendar: add, complete, delete, change due date; grouped into Overdue / Today / Upcoming / Completed. On phones it is a button that opens the list
- Monthly view: a large calendar showing tasks and project deadlines in each project's colour (coloured dots on phones)
- Weekly view: the Weekly button replaces the calendar with one card per day
- Two-way sync: tick a task anywhere, or drag it to another day on the calendar or weekly view, and every view updates

## Folder structure

```
devtrack/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example                 Supabase keys go in .env.local (Phase 2)
├── docs/
│   └── BUILD_PLAN.md            Phase-by-phase build plan
├── supabase/
│   └── schema.sql               Tables, indexes, RLS policies, realtime
└── src/
    ├── main.tsx                 Entry point
    ├── App.tsx                  Shell: sidebar + current page
    ├── types.ts                 Project and Task types (mirror the DB columns)
    ├── store/
    │   └── StoreContext.tsx     Single source of truth for projects and tasks
    ├── lib/
    │   ├── dates.ts             Local-time date helpers
    │   ├── labels.ts            Status/priority labels and the colour palette
    │   └── supabase.ts          Supabase client (unused until Phase 2)
    ├── data/
    │   └── seed.ts              Sample data for first run
    ├── hooks/
    │   ├── useTheme.ts          Light/dark toggle
    │   └── useIsMobile.ts       True on phone-sized screens
    ├── pages/
    │   ├── PlannerPage.tsx      To-do list, then the month calendar or weekly view
    │   └── ProjectsPage.tsx     Project card grid
    ├── components/
    │   ├── layout/Sidebar.tsx
    │   ├── projects/ProjectCard.tsx
    │   ├── projects/ProjectDialog.tsx
    │   ├── tasks/TaskQuickAdd.tsx
    │   ├── tasks/TaskList.tsx
    │   ├── tasks/TaskItem.tsx
    │   ├── calendar/MonthCalendar.tsx
    │   ├── calendar/WeekView.tsx
    │   └── calendar/useDateDrop.ts   Drag a task to another day
    └── styles/
        └── global.css           Theme tokens and all component styles
```

## How the sync works

```
          ┌──────────────────────────────┐
          │  StoreContext (projects,     │
          │  tasks + update functions)   │
          └──────┬───────────────┬───────┘
         reads / │               │ reads /
         writes  │               │ writes
          ┌──────▼─────┐   ┌─────▼─────────────────────┐
          │  TaskList  │   │ MonthCalendar / WeekView  │
          └────────────┘   └───────────────────────────┘
```

The calendar has no data of its own. It converts `tasks` (and each project's
`due_date`) into events every time the store changes. Ticking a checkbox calls
`toggleTask()`, and dragging an event calls `updateTask({ due_date })`: the same
functions the list uses. Because there is only one copy of each task, the two
views cannot go out of sync. The database follows the same rule: there is no
`calendar_events` table.

## Design

- Palette: Lavender `#BBB7E5`, Light Rose `#F7DFDF`, Pistachio `#BDC594`, Snow `#DAE9FA`,
  Baby Pink `#EFBDBD`, Pale Yellow `#F1ECC6`. Text and outlines use a dark plum-grey (`#3D3547`).
- Type: Instrument Serif for headings (with italic accent words), Inter for everything else.
- Every colour is a variable at the top of `src/styles/global.css`; project swatches are in `src/lib/labels.ts`.
- The calendar and weekly view are plain React components (no calendar library), so their
  markup and styles are fully yours to change. Dragging uses the browser's built-in drag and
  drop, which works with a mouse; on touch screens, change a date by tapping it in the to-do list.
