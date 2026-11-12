# DevTrack build plan

Each phase is small enough for one or two sittings and ends with something that
works. Finish a phase before starting the next; the app is usable after every one.

## Database schema (reference)

Full SQL: [`supabase/schema.sql`](../supabase/schema.sql)

```
auth.users (managed by Supabase)
   │ 1
   ├──── 1 profiles      (id PK/FK, display_name)
   │
   ├──── * projects      (id PK, user_id FK, title, description, repo_url,
   │        │             status, priority, color, due_date, archived_at)
   │        │ 1
   │        ├──── * tasks         (id PK, user_id FK, project_id FK NULLABLE,
   │        │                      title, notes, due_date, priority, completed_at)
   │        │
   │        └──── * project_tags  (project_id FK, tag_id FK; composite PK)
   │                    * │
   └──── * tags ──────────┘ 1     (id PK, user_id FK, name; unique per user)
```

| Decision | Reason |
| --- | --- |
| No calendar table | Calendar events are derived from `tasks.due_date` and `projects.due_date`, so the list and calendar read the same rows. |
| `tasks.project_id` nullable | A null value is a standalone daily task. `ON DELETE CASCADE` removes a project's tasks with it. |
| `completed_at` instead of a boolean | One column records both whether and when a task was done. |
| `tags` + `project_tags` | Tech stack is many-to-many. Storing each tag once avoids repeated text and allows filtering by tag. |
| `archived_at` on projects | Archiving is a soft delete: the project and its history can be restored. |
| `due_date` is `date`, not `timestamptz` | Deadlines are calendar days. Using a plain date avoids time-zone shifts. |
| Row Level Security on every table | The browser talks to the database directly, so the database enforces that users only reach their own rows. |

---

## Phase 0 — Run the starter (about 30 minutes)

- [ ] `npm install`, then `npm run dev`
- [ ] Click through both pages; tick a task in the list and watch the calendar; drag a calendar event and watch the list
- [ ] Read `src/store/StoreContext.tsx`: every later phase builds on it
- [ ] `git init`, commit, and push to GitHub

**Done when:** the app runs locally and the code is on GitHub.

## Phase 1 — Finish the local MVP

All work stays in the browser; no backend yet.

- [ ] Task editing: click a task title to rename it; add a notes field
- [ ] Archived projects: a "Show archived" toggle on the Projects page with a Restore button
- [ ] Filters on the Projects page: by status and by tech-stack tag
- [ ] Click an empty calendar day to add a task for that date (an `onClick` on the day cell in `MonthCalendar.tsx`)
- [ ] On phones, tap a calendar day to show only that day's tasks
- [ ] Empty states and basic form validation

**Done when:** you can manage a real week of coursework using only this app.

## Phase 2 — Supabase project and login

- [ ] Create a free project at supabase.com
- [ ] Paste `supabase/schema.sql` into the SQL Editor and run it
- [ ] Copy `.env.example` to `.env.local` and fill in the URL and anon key
- [ ] Add `src/pages/LoginPage.tsx` with email + password sign-up and sign-in:
      `supabase.auth.signUp(...)`, `supabase.auth.signInWithPassword(...)`
- [ ] In `App.tsx`, show the login page when there is no session
      (`supabase.auth.getSession()` and `supabase.auth.onAuthStateChange(...)`)
- [ ] Add a sign-out button to the sidebar

**Done when:** you can sign up, sign in, and sign out, and a `profiles` row appears for each new account.

## Phase 3 — Move the data to Supabase

Only `StoreContext.tsx` changes. Components keep calling the same functions.

- [ ] Load on sign-in:

```ts
const { data: tasks } = await supabase.from('tasks').select('*').order('due_date')

const { data: rows } = await supabase
  .from('projects')
  .select('*, project_tags(tags(name))')
// flatten: rows.map(r => ({ ...r, tags: r.project_tags.map(pt => pt.tags.name) }))
```

- [ ] Replace each store function with an optimistic update: change local state
      first, send the query, and roll back if it returns an error. Example:

```ts
toggleTask: async (id) => {
  const previous = data.tasks
  const task = previous.find((t) => t.id === id)!
  const completed_at = task.completed_at ? null : new Date().toISOString()
  setTasks((tasks) => tasks.map((t) => (t.id === id ? { ...t, completed_at } : t)))   // 1. instant UI
  const { error } = await supabase.from('tasks').update({ completed_at }).eq('id', id) // 2. save
  if (error) setTasks(() => previous)                                                  // 3. undo on failure
}
```

- [ ] Start with tasks (add, update, toggle, delete), then projects, then tags
      (upsert into `tags`, then insert into `project_tags`)
- [ ] Remove the localStorage code and seed data once everything loads from the database

**Done when:** data survives a hard refresh and appears when you sign in on your phone.

## Phase 4 — Realtime

- [ ] Subscribe to changes so a second tab or device updates without a refresh:

```ts
supabase
  .channel('db-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
    // INSERT / UPDATE: upsert payload.new into state; DELETE: remove payload.old.id
  })
  .subscribe()
```

- [ ] Repeat for `projects`; unsubscribe on sign-out

**Done when:** ticking a task on your phone ticks it on your laptop within a second or two.

## Phase 5 — Deploy

- [ ] Import the GitHub repository into Vercel or Netlify (both detect Vite automatically)
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
- [ ] In Supabase → Authentication → URL Configuration, add the deployed URL
- [ ] Test sign-up and the full flow on your phone

**Done when:** the app is live at a public URL.

## Phase 6 — Polish (pick what you want)

- [ ] URL routing with React Router (`/planner`, `/projects/:id`) so pages can be bookmarked
- [ ] Keyboard shortcuts (`n` for new task, `/` for search)
- [ ] Search across tasks and projects
- [ ] "Add to Home Screen" support with `vite-plugin-pwa`
- [ ] GitHub sign-in (`supabase.auth.signInWithOAuth({ provider: 'github' })`)
- [ ] Time-of-day deadlines: add a `due_time time` column and show the time on each task
- [ ] Touch drag-and-drop on tablets (for example with the `@dnd-kit/core` library)
