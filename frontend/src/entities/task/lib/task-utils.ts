import { TaskStatusEnum, type Task } from '../model/types'

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
 * Checks if a task is overdue based on its deadline and current status.
 */
export const isTaskOverdue = (task: Task) => {
  const { deadline, status } = task
  if (!deadline) return false

  return new Date(deadline) < new Date() && status !== TaskStatusEnum.COMPLETED
}

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
  return existingFiles
}

async function urlToFile(url: string, filename: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}
