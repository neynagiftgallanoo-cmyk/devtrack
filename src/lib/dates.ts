import type { ISODate } from '../types'

// All helpers work in the user's LOCAL time zone. Avoid `date.toISOString()`
// for calendar dates: it converts to UTC and can shift the day by one.

export function toISODate(date: Date): ISODate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): ISODate {
  return toISODate(new Date())
}

export function addDays(iso: ISODate, days: number): ISODate {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** "Today", "Tomorrow", "Yesterday", or a short date such as "Nov 14". */
export function formatDue(iso: ISODate): string {
  const today = todayISO()
  if (iso === today) return 'Today'
  if (iso === addDays(today, 1)) return 'Tomorrow'
  if (iso === addDays(today, -1)) return 'Yesterday'
  const date = parseISODate(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}

/** The Sunday that starts the week containing `iso`. */
export function startOfWeek(iso: ISODate): ISODate {
  const date = parseISODate(iso)
  date.setDate(date.getDate() - date.getDay())
  return toISODate(date)
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000)
}

/** For example "Thursday, 12 November". */
export function formatLong(iso: ISODate): string {
  return parseISODate(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** For example "8 Nov". */
export function formatShort(iso: ISODate): string {
  return parseISODate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
