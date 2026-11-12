import type { Project, Task } from '../types'
import { addDays, todayISO } from '../lib/dates'

// Sample data shown on first run so the UI is not empty.
// Dates are relative to today so the calendar always has something on it.

export const LOCAL_USER_ID = 'local-user'

const now = new Date().toISOString()
const today = todayISO()

function project(p: Pick<Project, 'id' | 'title' | 'status' | 'priority' | 'color' | 'tags'> & Partial<Project>): Project {
  return {
    user_id: LOCAL_USER_ID,
    description: null,
    repo_url: null,
    due_date: null,
    archived_at: null,
    created_at: now,
    updated_at: now,
    ...p,
  }
}

function task(t: Pick<Task, 'id' | 'title' | 'due_date'> & Partial<Task>): Task {
  return {
    user_id: LOCAL_USER_ID,
    project_id: null,
    notes: null,
    priority: 'medium',
    completed_at: null,
    created_at: now,
    updated_at: now,
    ...t,
  }
}

export const seedProjects: Project[] = [
  project({
    id: 'p-capstone',
    title: 'Capstone: Campus Event App',
    description: 'Event discovery and RSVP app for student organizations.',
    repo_url: 'https://github.com/your-username/capstone',
    status: 'in_progress',
    priority: 'high',
    color: '#EFBDBD',
    due_date: addDays(today, 24),
    tags: ['React', 'Supabase', 'TypeScript'],
  }),
  project({
    id: 'p-db',
    title: 'Database Systems: Library ERD',
    description: 'Normalized schema and queries for a library system.',
    status: 'testing',
    priority: 'medium',
    color: '#BBB7E5',
    due_date: addDays(today, 9),
    tags: ['PostgreSQL', 'SQL'],
  }),
  project({
    id: 'p-algo',
    title: 'Algorithms: Pathfinding Visualizer',
    description: 'Visualize BFS, Dijkstra, and A* on a grid.',
    repo_url: 'https://github.com/your-username/pathfinding',
    status: 'planning',
    priority: 'low',
    color: '#BDC594',
    tags: ['Python', 'Pygame'],
  }),
]

export const seedTasks: Task[] = [
  task({ id: 't-1', title: 'Normalize database to 3NF', project_id: 'p-db', due_date: addDays(today, 2), priority: 'high' }),
  task({ id: 't-2', title: 'Write sample JOIN queries', project_id: 'p-db', due_date: addDays(today, 5) }),
  task({ id: 't-3', title: 'Fix API CORS error', project_id: 'p-capstone', due_date: today, priority: 'high' }),
  task({ id: 't-4', title: 'Build RSVP form', project_id: 'p-capstone', due_date: addDays(today, 4) }),
  task({ id: 't-5', title: 'Set up auth flow', project_id: 'p-capstone', due_date: addDays(today, -2), completed_at: now }),
  task({ id: 't-6', title: 'Draft grid data structure', project_id: 'p-algo', due_date: addDays(today, 8), priority: 'low' }),
  task({ id: 't-7', title: 'Review discrete math notes', due_date: addDays(today, 1), priority: 'low' }),
  task({ id: 't-8', title: 'Submit lab report', due_date: addDays(today, -1), priority: 'medium' }),
]
