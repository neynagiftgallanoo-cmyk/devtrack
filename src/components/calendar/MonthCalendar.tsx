import { useMemo, useState, type CSSProperties } from 'react'
import type { ISODate, Project, Task } from '../../types'
import { STANDALONE_COLOR, STANDALONE_LABEL } from '../../lib/labels'
import { WEEKDAYS, addDays, todayISO, toISODate } from '../../lib/dates'
import { useStore } from '../../store/StoreContext'
import { dragSource, useDateDrop } from './useDateDrop'

interface Props {
  tasks: Task[]
  projects: Project[]
  /** Phone layout: small cells with a coloured dot per task instead of task names. */
  compact: boolean
}

/**
 * Month grid. It stores no data of its own: it draws the tasks and project
 * deadlines it is given, and every interaction calls the same store functions
 * as the to-do list (toggleTask, updateTask, updateProject).
 */
export default function MonthCalendar({ tasks, projects, compact }: Props) {
  const { toggleTask } = useStore()
  const { overDate, dropTarget } = useDateDrop()
  const today = todayISO()

  // The month on screen, as the first day of that month.
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const shiftMonth = (by: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + by, 1))
  const goToToday = () => {
    const now = new Date()
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  // Every date shown: whole weeks (Sunday to Saturday) covering the month.
  const cells = useMemo(() => {
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const leading = cursor.getDay()
    const total = Math.ceil((leading + daysInMonth) / 7) * 7
    const first = addDays(toISODate(cursor), -leading)
    return Array.from({ length: total }, (_, i) => addDays(first, i))
  }, [cursor])

  const monthPrefix = toISODate(cursor).slice(0, 7) // 'YYYY-MM'
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  const tasksOn = (date: ISODate) => tasks.filter((t) => t.due_date === date)
  const deadlinesOn = (date: ISODate) => projects.filter((p) => p.due_date === date)
  const colorOf = (task: Task) => (task.project_id && projectById.get(task.project_id)?.color) || STANDALONE_COLOR

  const usesStandalone = tasks.some((t) => !t.project_id)

  return (
    <section className={`calendar card ${compact ? 'calendar--compact' : ''}`} aria-label="Calendar">
      <div className="calendar__head">
        <h2 className="section-title">
          {cursor.toLocaleDateString('en-GB', { month: 'long' })} <em>{cursor.getFullYear()}</em>
        </h2>
        <div className="calendar__tools">
          {!compact && <Legend projects={projects} showStandalone={usesStandalone} />}
          <div className="calendar__nav">
            <button type="button" className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <Arrow direction="left" />
            </button>
            <button type="button" className="btn btn--outline" onClick={goToToday}>
              Today
            </button>
            <button type="button" className="icon-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
              <Arrow direction="right" />
            </button>
          </div>
        </div>
      </div>

      <div className="cal-scroll">
        <div className="cal-grid">
          <div className="cal-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day}>{compact ? day[0] : day}</div>
            ))}
          </div>
          <div className="cal-cells">
            {cells.map((date) => {
              const inMonth = date.startsWith(monthPrefix)
              const dayNumber = Number(date.slice(8))
              const dayTasks = tasksOn(date)
              const deadlines = deadlinesOn(date)
              const numClass = `cal-num ${date === today ? 'is-today' : ''} ${compact && deadlines.length ? 'is-deadline' : ''}`

              return (
                <div
                  key={date}
                  className={`cal-cell ${inMonth ? '' : 'is-out'} ${overDate === date ? 'is-over' : ''}`}
                  {...(compact ? {} : dropTarget(date))}
                >
                  <span className={numClass}>{dayNumber}</span>

                  {compact ? (
                    <span className="cal-dots" aria-hidden="true">
                      {dayTasks.map((task) => (
                        <span
                          key={task.id}
                          className={`cal-dot ${task.completed_at ? 'is-done' : ''}`}
                          style={{ background: colorOf(task) }}
                        />
                      ))}
                    </span>
                  ) : (
                    <>
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`chip ${task.completed_at ? 'is-done' : ''}`}
                          style={{ '--chip-color': colorOf(task) } as CSSProperties}
                          title={task.title}
                          {...dragSource('task', task.id)}
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox--small"
                            checked={Boolean(task.completed_at)}
                            onChange={() => toggleTask(task.id)}
                            aria-label={`Mark "${task.title}" as ${task.completed_at ? 'not done' : 'done'}`}
                          />
                          <span className="chip__title">{task.title}</span>
                        </div>
                      ))}
                      {deadlines.map((project) => (
                        <div
                          key={project.id}
                          className="chip chip--deadline"
                          title={`${project.title} deadline`}
                          {...dragSource('project', project.id)}
                        >
                          <span className="chip__title">{project.title} deadline</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {compact && (
        <div className="legend legend--below">
          <Legend projects={projects} showStandalone={usesStandalone} />
          <span className="legend__item">
            <span className="legend__ring" aria-hidden="true" />
            Project deadline
          </span>
        </div>
      )}
    </section>
  )
}

function Legend({ projects, showStandalone }: { projects: Project[]; showStandalone: boolean }) {
  return (
    <div className="legend">
      {projects.map((project) => (
        <span key={project.id} className="legend__item">
          <span className="dot" style={{ background: project.color }} aria-hidden="true" />
          {project.title.split(':')[0]}
        </span>
      ))}
      {showStandalone && (
        <span className="legend__item">
          <span className="dot" style={{ background: STANDALONE_COLOR }} aria-hidden="true" />
          {STANDALONE_LABEL}
        </span>
      )}
    </div>
  )
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  )
}
