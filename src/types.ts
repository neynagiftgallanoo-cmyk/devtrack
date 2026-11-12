// These types mirror the database columns in supabase/schema.sql one-to-one,
// so swapping localStorage for Supabase later needs no renaming.

export type ProjectStatus = 'planning' | 'in_progress' | 'testing' | 'completed'
export type Priority = 'low' | 'medium' | 'high'

/** Calendar dates are plain 'YYYY-MM-DD' strings (Postgres `date`), never Date objects. */
export type ISODate = string

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  repo_url: string | null
  status: ProjectStatus
  priority: Priority
  color: string
  due_date: ISODate | null
  archived_at: string | null
  created_at: string
  updated_at: string
  /** Flattened from the tags / project_tags tables. */
  tags: string[]
}

export interface Task {
  id: string
  user_id: string
  /** null = standalone task */
  project_id: string | null
  title: string
  notes: string | null
  due_date: ISODate
  priority: Priority
  /** null = open; timestamp = done */
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type ProjectInput = Pick<
  Project,
  'title' | 'description' | 'repo_url' | 'status' | 'priority' | 'color' | 'due_date' | 'tags'
>

export type TaskInput = Pick<Task, 'title' | 'project_id' | 'due_date' | 'priority'>
