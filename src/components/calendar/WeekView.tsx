import { useMemo, useState } from 'react'
import type { Project, Task } from '../../types'
import { STANDALONE_LABEL } from '../../lib/labels'
import { WEEKDAYS, addDays, formatShort, startOfWeek, todayISO } from '../../lib/dates'
import { useStore } from '../../store/StoreContext'
import { dragSource, useDateDrop } from './useDateDrop'

interface Props {
  tasks: Task[]
  projects: Project[]
}

/**
 * Weekly to-do view: one card per day, shown in place of the month calendar.
 * Like the calendar it only draws what the store holds; ticking a task or
 * dragging it to another day updates the same task everywhere.
 */
export default function WeekView({ tasks, projects }: Props) {
  const { toggleTask } = useStore()
  const { overDate, dropTarget } = useDateDrop()
  const today = todayISO()

  // 0 = the current week, -1 = last week, 1 = next week...
  const [offset, setOffset] = useState(0)
  const weekStart = addDays(startOfWeek(today), offset * 7)
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  const weekEnd = days[6]
  const openThisWeek = tasks.filter((t) => !t.completed_at && t.due_date >= weekStart && t.due_date <= weekEnd).length

  return (
    <section className="week" aria-label="Weekly to-do list">
      <div className="week__head">
        <h2 className="section-title">
          {offset === 0 ? (
            <>
              This <em>week</em>
            </>
          ) : (
            <>
              Week of <em>{formatShort(weekStart)}</em>
            </>
          )}
        </h2>
        <div className="week__tools">
          <span className="week__range">
            {formatShort(weekStart)} – {formatShort(weekEnd)} · {openThisWeek} to do
          </span>
          <div className="calendar__nav">
            <button type="button" className="icon-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Previous week">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            {offset !== 0 && (
              <button type="button" className="btn btn--outline" onClick={() => setOffset(0)}>
                This week
              </button>
            )}
            <button type="button" className="icon-btn" onClick={() => setOffset((o) => o + 1)} aria-label="Next week">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="week__days">
        {days.map((date, index) => {
          const dayTasks = tasks.filter((t) => t.due_date === date)
          const deadlines = projects.filter((p) => p.due_date === date)
          const isEmpty = dayTasks.length === 0 && deadlines.length === 0

          return (
            <div
              key={date}
              className={`day-card ${date === today ? 'is-today' : ''} ${overDate === date ? 'is-over' : ''}`}
              {...dropTarget(date)}
            >
              <div className="day-card__head">
                <span className="day-card__name">{WEEKDAYS[index]}</span>
                <span className="day-card__num">{Number(date.slice(8))}</span>
              </div>

              <div className="day-card__tasks">
                {dayTasks.map((task) => {
                  const project = task.project_id ? projectById.get(task.project_id) : undefined
                  return (
                    <div key={task.id} className={`day-task ${task.completed_at ? 'is-done' : ''}`} {...dragSource('task', task.id)}>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={Boolean(task.completed_at)}
                        onChange={() => toggleTask(task.id)}
                        aria-label={`Mark "${task.title}" as ${task.completed_at ? 'not done' : 'done'}`}
                      />
                      <span className="day-task__text">
                        <span className="day-task__title">{task.title}</span>
                        <span className="day-task__project">{project ? project.title.split(':')[0] : STANDALONE_LABEL}</span>
                      </span>
                    </div>
                  )
                })}
                {deadlines.map((project) => (
                  <div key={project.id} className="chip chip--deadline" {...dragSource('project', project.id)}>
                    <span className="chip__title">{project.title.split(':')[0]} deadline</span>
                  </div>
                ))}
                {isEmpty && <span className="day-card__empty">Nothing due</span>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
