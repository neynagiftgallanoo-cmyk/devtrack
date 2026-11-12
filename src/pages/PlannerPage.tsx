import { useState } from 'react'
import MonthCalendar from '../components/calendar/MonthCalendar'
import WeekView from '../components/calendar/WeekView'
import TaskList from '../components/tasks/TaskList'
import TaskQuickAdd, { NEW_TASK_INPUT_ID } from '../components/tasks/TaskQuickAdd'
import { useIsMobile } from '../hooks/useIsMobile'
import { addDays, daysBetween, formatLong, startOfWeek, todayISO } from '../lib/dates'
import { useStore } from '../store/StoreContext'

interface Props {
  projectFilter: string | null
  onClearFilter: () => void
}

type Mode = 'month' | 'week'

/**
 * Planner: the to-do list on top, then either the month calendar (Monthly)
 * or the weekly day cards (Weekly). All three read the same `visibleTasks`.
 * On phones the to-do list is collapsed into a button that opens it.
 */
export default function PlannerPage({ projectFilter, onClearFilter }: Props) {
  const { projects, tasks } = useStore()
  const isMobile = useIsMobile()
  const [mode, setMode] = useState<Mode>('month')
  const [listOpen, setListOpen] = useState(false) // phones only

  const today = todayISO()
  const activeProjects = projects.filter((p) => !p.archived_at)
  const activeIds = new Set(activeProjects.map((p) => p.id))
  const filterProject = activeProjects.find((p) => p.id === projectFilter)

  // Hide tasks of archived projects; apply the sidebar's project filter if set.
  const visibleTasks = tasks.filter((t) => {
    if (t.project_id && !activeIds.has(t.project_id)) return false
    return filterProject ? t.project_id === filterProject.id : true
  })
  const visibleProjects = filterProject ? [filterProject] : activeProjects

  // Numbers for the summary strip
  const open = visibleTasks.filter((t) => !t.completed_at)
  const weekStart = startOfWeek(today)
  const weekEnd = addDays(weekStart, 6)
  const dueThisWeek = open.filter((t) => t.due_date >= weekStart && t.due_date <= weekEnd).length
  const overdue = open.filter((t) => t.due_date < today).length
  const nextDeadline = visibleProjects
    .filter((p) => p.due_date && p.due_date >= today && p.status !== 'completed')
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))[0]
  const deadlineIn = nextDeadline ? daysBetween(today, nextDeadline.due_date!) : 0

  const focusNewTask = () => {
    setListOpen(true)
    // Wait for the list to open on phones before focusing the field.
    setTimeout(() => document.getElementById(NEW_TASK_INPUT_ID)?.focus(), 0)
  }

  const listTitle = (
    <>
      To-<em>do</em> list
    </>
  )

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__text">
          <span className="date-tag">{formatLong(today)}</span>
          <h1 className="display">
            Your {mode === 'month' ? 'month' : 'week'}, <em>at a glance</em>
          </h1>
          {filterProject && (
            <p className="filter-note">
              <span className="dot" style={{ background: filterProject.color }} aria-hidden="true" />
              Showing {filterProject.title} ·{' '}
              <button type="button" className="link" onClick={onClearFilter}>
                Show all projects
              </button>
            </p>
          )}
        </div>

        <div className="hero__actions">
          <div className="switch" role="group" aria-label="Planner view">
            <button type="button" className={mode === 'month' ? 'is-active' : ''} aria-pressed={mode === 'month'} onClick={() => setMode('month')}>
              Monthly
            </button>
            <button type="button" className={mode === 'week' ? 'is-active' : ''} aria-pressed={mode === 'week'} onClick={() => setMode('week')}>
              Weekly
            </button>
          </div>
          <button type="button" className="btn btn--primary" onClick={focusNewTask}>
            + New task
          </button>
        </div>
      </header>

      <div className="ticker">
        <span>{open.length} open {open.length === 1 ? 'task' : 'tasks'}</span>
        <span className="ticker__dot" aria-hidden="true" />
        <span>{dueThisWeek} due this week</span>
        <span className="ticker__dot" aria-hidden="true" />
        <span>{overdue} overdue</span>
        {nextDeadline && (
          <>
            <span className="ticker__dot ticker__extra" aria-hidden="true" />
            <em className="ticker__extra">
              {nextDeadline.title.split(':')[0]} deadline {deadlineIn === 0 ? 'today' : `in ${deadlineIn} ${deadlineIn === 1 ? 'day' : 'days'}`}
            </em>
          </>
        )}
      </div>

      <div className="planner">
        <section className="todo card" aria-label="To-do list">
          {isMobile ? (
            <h2 className="todo__heading">
              <button type="button" className="todo__toggle" aria-expanded={listOpen} onClick={() => setListOpen((v) => !v)}>
                <span className="section-title">{listTitle}</span>
                <span className="todo__summary">
                  <span className="count-pill">{open.length} open</span>
                  <svg className={`chevron ${listOpen ? 'is-open' : ''}`} aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
            </h2>
          ) : (
            <div className="todo__head">
              <h2 className="section-title">{listTitle}</h2>
              <span className="count-pill">{open.length} open</span>
            </div>
          )}

          {(!isMobile || listOpen) && (
            <div className="todo__body">
              {/* key resets the form's default project when the filter changes */}
              <TaskQuickAdd key={filterProject?.id ?? 'all'} projects={activeProjects} defaultProjectId={filterProject?.id ?? null} />
              <TaskList tasks={visibleTasks} projects={activeProjects} />
            </div>
          )}
        </section>

        {mode === 'month' ? (
          <MonthCalendar tasks={visibleTasks} projects={visibleProjects} compact={isMobile} />
        ) : (
          <WeekView tasks={visibleTasks} projects={visibleProjects} />
        )}
      </div>
    </div>
  )
}
