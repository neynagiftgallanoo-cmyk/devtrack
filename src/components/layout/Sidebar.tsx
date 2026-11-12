import { useStore } from '../../store/StoreContext'
import { useTheme } from '../../hooks/useTheme'
import { STATUS_LABEL } from '../../lib/labels'

export type View = 'planner' | 'projects'

interface Props {
  view: View
  onNavigate: (view: View) => void
  activeProjectId: string | null
  onSelectProject: (projectId: string | null) => void
  onNewProject: () => void
}

const ICONS: Record<View, string> = {
  planner: 'M6 5h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM3 10h18M8 3v4M16 3v4',
  projects: 'M5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM15 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM5 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM15 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z',
}

/**
 * Desktop: left sidebar with navigation and the full project list.
 * Phones (see global.css): becomes a bottom bar with Planner, Projects
 * and the theme button; the project list lives on the Projects page.
 */
export default function Sidebar({ view, onNavigate, activeProjectId, onSelectProject, onNewProject }: Props) {
  const { projects, tasks } = useStore()
  const { theme, toggleTheme } = useTheme()
  const activeProjects = projects.filter((p) => !p.archived_at)

  const openCount = (projectId: string) =>
    tasks.filter((t) => t.project_id === projectId && !t.completed_at).length

  const navItem = (target: View, label: string) => (
    <button
      type="button"
      className={`nav-item ${view === target && !activeProjectId ? 'is-active' : ''}`}
      onClick={() => (target === 'planner' ? onSelectProject(null) : onNavigate(target))}
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICONS[target]} />
      </svg>
      <span>{label}</span>
    </button>
  )

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        Dev<em>Track</em>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {navItem('planner', 'Planner')}
        {navItem('projects', 'Projects')}
      </nav>

      <div className="sidebar__section">
        <div className="sidebar__heading">My projects</div>
        {activeProjects.map((project) => (
          <button
            key={project.id}
            type="button"
            className={`project-link ${activeProjectId === project.id ? 'is-active' : ''}`}
            onClick={() => onSelectProject(project.id)}
            title={`Show tasks for ${project.title}`}
          >
            <span className="dot" style={{ background: project.color }} aria-hidden="true" />
            <span className="project-link__text">
              <span className="project-link__name">{project.title}</span>
              <span className="project-link__sub">{STATUS_LABEL[project.status]}</span>
            </span>
            <span className="count-badge" aria-label={`${openCount(project.id)} open tasks`}>
              {openCount(project.id)}
            </span>
          </button>
        ))}
        {activeProjects.length === 0 && <p className="sidebar__empty">No projects yet.</p>}
      </div>

      <div className="sidebar__footer">
        <button type="button" className="btn btn--outline sidebar__new" onClick={onNewProject}>
          + New project
        </button>
        <button type="button" className="nav-item sidebar__theme" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {theme === 'dark' ? (
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            ) : (
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            )}
          </svg>
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </aside>
  )
}
