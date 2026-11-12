import { useState, type FormEvent } from 'react'
import type { Priority, Project } from '../../types'
import { PRIORITY_LABEL, PRIORITY_ORDER } from '../../lib/labels'
import { todayISO } from '../../lib/dates'
import { useStore } from '../../store/StoreContext'

/** The planner's "+ New task" button focuses this field. */
export const NEW_TASK_INPUT_ID = 'new-task-title'

interface Props {
  projects: Project[]
  /** Pre-selects a project when the planner is filtered to one. */
  defaultProjectId: string | null
}

export default function TaskQuickAdd({ projects, defaultProjectId }: Props) {
  const { addTask } = useStore()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(todayISO())
  const [projectId, setProjectId] = useState(defaultProjectId ?? '')
  const [priority, setPriority] = useState<Priority>('medium')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !dueDate) return
    addTask({ title: title.trim(), due_date: dueDate, project_id: projectId || null, priority })
    setTitle('')
  }

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <input
        id={NEW_TASK_INPUT_ID}
        className="quick-add__title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task"
        aria-label="Task title"
      />
      <div className="quick-add__row">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Due date" required />
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} aria-label="Project">
          <option value="">Personal</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority">
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn--primary" disabled={!title.trim()}>
          Add
        </button>
      </div>
    </form>
  )
}
