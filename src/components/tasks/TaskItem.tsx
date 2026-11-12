import { useRef } from 'react'
import type { Project, Task } from '../../types'
import { PRIORITY_LABEL, STANDALONE_COLOR, STANDALONE_LABEL } from '../../lib/labels'
import { formatDue, todayISO } from '../../lib/dates'
import { useStore } from '../../store/StoreContext'

interface Props {
  task: Task
  project: Project | undefined
}

export default function TaskItem({ task, project }: Props) {
  const { toggleTask, updateTask, deleteTask } = useStore()
  const done = Boolean(task.completed_at)
  const overdue = !done && task.due_date < todayISO()
  const dateInput = useRef<HTMLInputElement>(null)

  return (
    <li className={`task ${done ? 'is-done' : ''}`}>
      <input
        type="checkbox"
        className="checkbox"
        checked={done}
        onChange={() => toggleTask(task.id)}
        aria-label={`Mark "${task.title}" as ${done ? 'not done' : 'done'}`}
      />

      <div className="task__body">
        <span className="task__title">{task.title}</span>
        <div className="task__meta">
          <span className="task__project">
            <span className="dot" style={{ background: project ? project.color : STANDALONE_COLOR }} aria-hidden="true" />
            {project ? project.title.split(':')[0] : STANDALONE_LABEL}
          </span>
          <span className={`badge badge--priority-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
        </div>
      </div>

      {/* Changing the date here moves the event on the calendar, and vice versa. */}
      <span className="task__due-wrap">
        <button
          type="button"
          className={`task__due ${overdue ? 'is-overdue' : ''}`}
          onClick={() => dateInput.current?.showPicker?.()}
          title="Change due date"
        >
          {formatDue(task.due_date)}
        </button>
        <input
          ref={dateInput}
          type="date"
          className="task__date-input"
          tabIndex={-1}
          value={task.due_date}
          onChange={(e) => e.target.value && updateTask(task.id, { due_date: e.target.value })}
          aria-label="Due date"
        />
      </span>

      <button type="button" className="task__delete" onClick={() => deleteTask(task.id)} aria-label={`Delete "${task.title}"`}>
        ×
      </button>
    </li>
  )
}
