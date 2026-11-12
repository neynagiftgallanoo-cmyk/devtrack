import type { CSSProperties } from 'react'
import type { Project, Task } from '../../types'
import { PRIORITY_LABEL, STATUS_LABEL } from '../../lib/labels'
import { formatDue } from '../../lib/dates'

interface Props {
  project: Project
  tasks: Task[]
  onOpen: () => void
  onEdit: () => void
}

export default function ProjectCard({ project, tasks, onOpen, onEdit }: Props) {
  const done = tasks.filter((t) => t.completed_at).length
  const total = tasks.length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <article className="card project-card" style={{ '--project-color': project.color } as CSSProperties}>
      <header className="project-card__header">
        <button type="button" className="project-card__title" onClick={onOpen} title="Open tasks in planner">
          {project.title}
        </button>
        <button type="button" className="btn btn--ghost btn--small" onClick={onEdit}>
          Edit
        </button>
      </header>

      {project.description && <p className="project-card__desc">{project.description}</p>}

      <div className="project-card__meta">
        <span className={`badge badge--status-${project.status}`}>{STATUS_LABEL[project.status]}</span>
        <span className={`badge badge--priority-${project.priority}`}>{PRIORITY_LABEL[project.priority]}</span>
        {project.due_date && <span className="muted small">Due {formatDue(project.due_date)}</span>}
      </div>

      {project.tags.length > 0 && (
        <ul className="tags">
          {project.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <footer className="project-card__footer">
        <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Tasks completed">
          <div className="progress__bar" style={{ width: `${percent}%` }} />
        </div>
        <span className="muted small">
          {done}/{total} tasks
        </span>
        {project.repo_url && (
          <a className="repo-link small" href={project.repo_url} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        )}
      </footer>
    </article>
  )
}
