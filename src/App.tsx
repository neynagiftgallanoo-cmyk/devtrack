import { useState } from 'react'
import Sidebar, { type View } from './components/layout/Sidebar'
import PlannerPage from './pages/PlannerPage'
import ProjectsPage from './pages/ProjectsPage'

export default function App() {
  const [view, setView] = useState<View>('planner')
  // When set, the planner shows only this project's tasks.
  const [projectFilter, setProjectFilter] = useState<string | null>(null)
  // Increases each time "+ New project" is pressed in the sidebar,
  // which tells the Projects page to open its form.
  const [newProjectRequest, setNewProjectRequest] = useState(0)

  const openProjectInPlanner = (projectId: string | null) => {
    setProjectFilter(projectId)
    setView('planner')
  }

  const startNewProject = () => {
    setView('projects')
    setNewProjectRequest((n) => n + 1)
  }

  return (
    <div className="app">
      <Sidebar
        view={view}
        onNavigate={setView}
        activeProjectId={view === 'planner' ? projectFilter : null}
        onSelectProject={openProjectInPlanner}
        onNewProject={startNewProject}
      />
      <main className="main">
        {view === 'planner' ? (
          <PlannerPage projectFilter={projectFilter} onClearFilter={() => setProjectFilter(null)} />
        ) : (
          <ProjectsPage onOpenProject={openProjectInPlanner} newProjectRequest={newProjectRequest} />
        )}
      </main>
    </div>
  )
}
