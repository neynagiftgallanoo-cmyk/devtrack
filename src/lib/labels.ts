import type { Priority, ProjectStatus } from '../types'

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  testing: 'Testing',
  completed: 'Completed',
}

export const STATUS_ORDER: ProjectStatus[] = ['planning', 'in_progress', 'testing', 'completed']

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low']

/**
 * The app's pastel palette. Projects pick one of these as their colour;
 * dark text is readable on all of them.
 */
export const PALETTE = {
  babyPink: '#EFBDBD',
  lavender: '#BBB7E5',
  pistachio: '#BDC594',
  paleYellow: '#F1ECC6',
  snow: '#DAE9FA',
  lightRose: '#F7DFDF',
} as const

/** Swatches offered in the project form. */
export const PROJECT_COLORS: string[] = Object.values(PALETTE)

/** Colour and label for tasks that belong to no project. */
export const STANDALONE_COLOR = PALETTE.paleYellow
export const STANDALONE_LABEL = 'Personal'
