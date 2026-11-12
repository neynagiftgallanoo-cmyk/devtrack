import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Project, ProjectInput, Task, TaskInput } from '../types'
import { LOCAL_USER_ID, seedProjects, seedTasks } from '../data/seed'

/**
 * The single source of truth for projects and tasks.
 *
 * Every screen (project cards, to-do list, calendar) reads from this store and
 * changes data only through the functions below. That is the whole "two-way
 * sync" mechanism: the calendar and the list are two views of the same array,
 * so an update made in one is immediately visible in the other.
 *
 * Right now the data lives in localStorage. In Phase 3 of docs/BUILD_PLAN.md
 * the body of each function is replaced with a Supabase query; the components
 * do not change.
 */
interface Store {
  projects: Project[]
  tasks: Task[]
  addProject: (input: ProjectInput) => void
  updateProject: (id: string, patch: Partial<ProjectInput>) => void
  archiveProject: (id: string) => void
  addTask: (input: TaskInput) => void
  updateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'notes' | 'project_id' | 'due_date' | 'priority'>>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
}

const StoreContext = createContext<Store | null>(null)

const STORAGE_KEY = 'devtrack:data:v1'

interface Snapshot {
  projects: Project[]
  tasks: Task[]
}

function loadSnapshot(): Snapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Snapshot
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.tasks)) return parsed
    }
  } catch {
    // Storage unavailable or corrupted: fall back to sample data.
  }
  return { projects: seedProjects, tasks: seedTasks }
}

const nowISO = () => new Date().toISOString()

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Snapshot>(loadSnapshot)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Ignore: the app still works for this session.
    }
  }, [data])

  const store = useMemo<Store>(() => {
    const setProjects = (fn: (projects: Project[]) => Project[]) =>
      setData((d) => ({ ...d, projects: fn(d.projects) }))
    const setTasks = (fn: (tasks: Task[]) => Task[]) => setData((d) => ({ ...d, tasks: fn(d.tasks) }))

    return {
      projects: data.projects,
      tasks: data.tasks,

      addProject: (input) =>
        setProjects((projects) => [
          ...projects,
          {
            ...input,
            id: crypto.randomUUID(),
            user_id: LOCAL_USER_ID,
            archived_at: null,
            created_at: nowISO(),
            updated_at: nowISO(),
          },
        ]),

      updateProject: (id, patch) =>
        setProjects((projects) =>
          projects.map((p) => (p.id === id ? { ...p, ...patch, updated_at: nowISO() } : p)),
        ),

      archiveProject: (id) =>
        setProjects((projects) =>
          projects.map((p) => (p.id === id ? { ...p, archived_at: nowISO(), updated_at: nowISO() } : p)),
        ),

      addTask: (input) =>
        setTasks((tasks) => [
          ...tasks,
          {
            ...input,
            id: crypto.randomUUID(),
            user_id: LOCAL_USER_ID,
            notes: null,
            completed_at: null,
            created_at: nowISO(),
            updated_at: nowISO(),
          },
        ]),

      updateTask: (id, patch) =>
        setTasks((tasks) => tasks.map((t) => (t.id === id ? { ...t, ...patch, updated_at: nowISO() } : t))),

      toggleTask: (id) =>
        setTasks((tasks) =>
          tasks.map((t) =>
            t.id === id ? { ...t, completed_at: t.completed_at ? null : nowISO(), updated_at: nowISO() } : t,
          ),
        ),

      deleteTask: (id) => setTasks((tasks) => tasks.filter((t) => t.id !== id)),
    }
  }, [data])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}
