import { useState, type DragEvent } from 'react'
import type { ISODate } from '../../types'
import { useStore } from '../../store/StoreContext'

// Drag-and-drop rescheduling, shared by the month grid and the weekly view.
// A dragged chip carries "task:<id>" or "project:<id>"; dropping it on a day
// writes that day's date back to the store, which also updates the to-do list.

const DRAG_TYPE = 'application/x-devtrack'

export type DragKind = 'task' | 'project'

/** Spread onto an element to make it draggable. */
export function dragSource(kind: DragKind, id: string) {
  return {
    draggable: true,
    onDragStart: (event: DragEvent<HTMLElement>) => {
      event.dataTransfer.setData(DRAG_TYPE, `${kind}:${id}`)
      event.dataTransfer.effectAllowed = 'move'
    },
  }
}

export function useDateDrop() {
  const { updateTask, updateProject } = useStore()
  // The date currently hovered while dragging, for highlighting.
  const [overDate, setOverDate] = useState<ISODate | null>(null)

  /** Spread onto a day cell to make it accept drops. */
  const dropTarget = (date: ISODate) => ({
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!event.dataTransfer.types.includes(DRAG_TYPE)) return
      event.preventDefault() // required for the browser to allow a drop here
      event.dataTransfer.dropEffect = 'move'
      setOverDate(date)
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setOverDate((current) => (current === date ? null : current))
      }
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      setOverDate(null)
      const payload = event.dataTransfer.getData(DRAG_TYPE)
      const separator = payload.indexOf(':')
      if (separator === -1) return
      const kind = payload.slice(0, separator)
      const id = payload.slice(separator + 1)
      if (kind === 'task') updateTask(id, { due_date: date })
      if (kind === 'project') updateProject(id, { due_date: date })
    },
  })

  return { overDate, dropTarget }
}
