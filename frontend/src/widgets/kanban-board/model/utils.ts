import { type Task, TaskStatusEnum } from '@/entities/task'

export type TaskColumns = Record<string, Task[]>

export const groupTasksByStatus = (tasks: Task[]): TaskColumns => {
  const result = Object.values(TaskStatusEnum).reduce<TaskColumns>(
    (acc, status) => ({ ...acc, [status]: [] }),
    {} as TaskColumns
  )

  for (const task of tasks) {
    result[task.status].push(task)
  }

  return result
}
