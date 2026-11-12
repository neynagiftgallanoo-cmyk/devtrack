import type { Project, Task } from '../../types'
import { todayISO } from '../../lib/dates'
import TaskItem from './TaskItem'

interface Props {
  tasks: Task[]
  projects: Project[]
}

const byDueDate = (a: Task, b: Task) => a.due_date.localeCompare(b.due_date)

export default function TaskList({ tasks, projects }: Props) {
  const today = todayISO()
  const projectById = new Map(projects.map((p) => [p.id, p]))

  const open = tasks.filter((t) => !t.completed_at).sort(byDueDate)
  const groups: { label: string; items: Task[] }[] = [
    { label: 'Overdue', items: open.filter((t) => t.due_date < today) },
    { label: 'Today', items: open.filter((t) => t.due_date === today) },
    { label: 'Upcoming', items: open.filter((t) => t.due_date > today) },
    { label: 'Completed', items: tasks.filter((t) => t.completed_at).sort(byDueDate).reverse() },
  ].filter((group) => group.items.length > 0)

  if (groups.length === 0) {
    return (
      <div className="empty">
        <p>Nothing here yet.</p>
        <p className="muted small">Add your first task above.</p>
      </div>
    )
  }

  return (
    <div className="task-groups">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="group-heading">
            {group.label} <span className="muted">{group.items.length}</span>
          </h3>
          <ul className="task-list">
            {group.items.map((task) => (
              <TaskItem key={task.id} task={task} project={task.project_id ? projectById.get(task.project_id) : undefined} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
