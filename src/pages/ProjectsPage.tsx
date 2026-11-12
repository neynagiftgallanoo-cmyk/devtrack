import { useEffect, useState } from 'react'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectDialog from '../components/projects/ProjectDialog'
import { useStore } from '../store/StoreContext'
import type { Project } from '../types'

interface Props {
  onOpenProject: (projectId: string) => void
  /** Changes when the sidebar's "+ New project" button is pressed. */
  newProjectRequest: number
}

export default function ProjectsPage({ onOpenProject, newProjectRequest }: Props) {
  const { projects, tasks, addProject, updateProject, archiveProject } = useStore()
  // undefined = dialog closed, 'new' = creating, a Project = editing it
  const [dialog, setDialog] = useState<Project | 'new' | undefined>()

  // Open the form when asked to from the sidebar.
  useEffect(() => {
    if (newProjectRequest > 0) setDialog('new')
  }, [newProjectRequest])

  const activeProjects = projects.filter((p) => !p.archived_at)

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__text">
          <span className="date-tag">{activeProjects.length} active</span>
          <h1 className="display">
            Your <em>projects</em>
          </h1>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setDialog('new')}>
          + New project
        </button>
      </header>

      {activeProjects.length === 0 ? (
        <div className="planner">
        <div className="empty">
          <p>No projects yet.</p>
          <p className="muted small">Create one to start attaching tasks and deadlines to it.</p>
        </div>
        </div>
      ) : (
        <div className="planner">
        <div className="project-grid">
          {activeProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks.filter((t) => t.project_id === project.id)}
              onOpen={() => onOpenProject(project.id)}
              onEdit={() => setDialog(project)}
            />
          ))}
        </div>
        </div>
      )}

      {dialog === 'new' && <ProjectDialog onSave={addProject} onClose={() => setDialog(undefined)} />}
      {dialog && dialog !== 'new' && (
        <ProjectDialog
          project={dialog}
          onSave={(input) => updateProject(dialog.id, input)}
          onArchive={() => archiveProject(dialog.id)}
          onClose={() => setDialog(undefined)}
        />
      )}
    </div>
  )
}
