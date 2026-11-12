import { useState, type FormEvent } from 'react'
import type { Priority, Project, ProjectInput, ProjectStatus } from '../../types'
import { PRIORITY_LABEL, PRIORITY_ORDER, PROJECT_COLORS, STATUS_LABEL, STATUS_ORDER } from '../../lib/labels'

interface Props {
  /** Pass a project to edit it; omit to create a new one. */
  project?: Project
  onSave: (input: ProjectInput) => void
  onArchive?: () => void
  onClose: () => void
}

export default function ProjectDialog({ project, onSave, onArchive, onClose }: Props) {
  const [title, setTitle] = useState(project?.title ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [repoUrl, setRepoUrl] = useState(project?.repo_url ?? '')
  const [tags, setTags] = useState(project?.tags.join(', ') ?? '')
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'planning')
  const [priority, setPriority] = useState<Priority>(project?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(project?.due_date ?? '')
  const [color, setColor] = useState(project?.color ?? PROJECT_COLORS[0])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    // "React, sql ,  Docker" -> ["React", "sql", "Docker"], without duplicates
    const tagList = [...new Set(tags.split(',').map((t) => t.trim()).filter(Boolean))]
    onSave({
      title: title.trim(),
      description: description.trim() || null,
      repo_url: repoUrl.trim() || null,
      status,
      priority,
      color,
      due_date: dueDate || null,
      tags: tagList,
    })
    onClose()
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={project ? 'Edit project' : 'New project'}>
      <div className="modal__backdrop" onClick={onClose} />
      <form className="modal__panel card" onSubmit={handleSubmit}>
        <h2>{project ? 'Edit project' : 'New project'}</h2>

        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Capstone project" required autoFocus />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </label>

        <label className="field">
          <span>Tech stack (comma-separated)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Python, React, SQL, Docker" />
        </label>

        <label className="field">
          <span>GitHub repository</span>
          <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/you/repo" />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Deadline</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>

        <div className="field">
          <span>Color</span>
          <div className="swatches">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${c === color ? 'is-selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                aria-pressed={c === color}
              />
            ))}
          </div>
        </div>

        <div className="modal__actions">
          {project && onArchive && (
            <button
              type="button"
              className="btn btn--ghost btn--danger"
              onClick={() => {
                onArchive()
                onClose()
              }}
            >
              Archive
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            {project ? 'Save' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  )
}
