import { type Task } from '../model/types'

/**
 * Calculates the total and completed items across all checklists of a task.
 */
export const calculateTaskProgress = (task: Task) => {
  const checklists = task.checklists ?? []

  const totalItems = checklists.reduce(
    (acc, checklist) => acc + (checklist.items?.length || 0),
    0
  )

  const completedItems = checklists.reduce(
    (acc, checklist) =>
      acc + (checklist.items?.filter((item) => item.completed).length || 0),
    0
  )

  return { totalItems, completedItems }
}

/**
 * A task is completed when `completedAt` is set (system-managed by the backend).
 * Prefer this over checking `status === COMPLETED` for display logic.
 */
export const isTaskCompleted = (task: Task): boolean =>
  Boolean(task.completedAt)

/**
 * A task is overdue when it has a dueDate in the past and has not been completed.
 * Uses `completedAt` (not status) so the check remains accurate after the refactor.
 */
export const isTaskOverdue = (task: Task): boolean =>
  !task.completedAt && !!task.dueDate && new Date(task.dueDate) < new Date()

/**
 * The effective start of a task for "days open" calculations.
 * Falls back to createdAt when startDate is absent.
 */
export const getTaskEffectiveStart = (task: Task): string =>
  task.startDate || task.createdAt

/**
 * Returns the single-point calendar anchor for placing a task on a calendar view.
 *
 * Decision: for this release the calendar uses single-point rendering.
 * Priority: dueDate → startDate → undefined (task is hidden from calendar).
 * Multi-day range rendering is explicitly out of scope for this PR.
 */
export const getTaskCalendarAnchor = (task: Task): string | undefined =>
  task.dueDate || task.startDate || undefined

/**
 * Returns the primary display date for list/card/table views.
 * Same priority as getTaskCalendarAnchor; kept separate to allow future divergence.
 */
export const getTaskDisplayDate = (task: Task): string | undefined =>
  task.dueDate || task.startDate || undefined

/**
 * True when a task has both a start and a due date (i.e., it has a date range).
 * Useful for future range-rendering in calendar/timeline views.
 */
export const hasTaskDateRange = (task: Task): boolean =>
  Boolean(task.startDate && task.dueDate)

/**
 * Loads files from URLs and converts them to File objects.
 */
export async function loadFilesFromUrls(urls: string[]) {
  if (!urls || urls.length === 0) return []

  const existingFiles = await Promise.all(
    urls
      .filter((url) => url.startsWith('http'))
      .map((url) => urlToFile(url, url.split('/').pop() || 'file'))
  )
  return existingFiles.filter((f): f is File => f !== null)
}

async function urlToFile(url: string, filename: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
  } catch (_error) {
    return null
  }
}
