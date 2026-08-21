import { format } from 'date-fns'
import { calculateTaskProgress, isTaskOverdue } from '../../lib/task-utils'
import { type Task, TaskStatusEnum } from '../../model/types'

export function useTaskCardData(task: Task) {
  const { totalItems, completedItems } = calculateTaskProgress(task)
  return {
    isCompleted: task.status === TaskStatusEnum.COMPLETED,
    overdue: isTaskOverdue(task),
    date: task.dueDate
      ? format(new Date(task.dueDate), 'dd.MM.yyyy')
      : undefined,
    totalItems,
    completedItems,
    hasAttachments: task.attachments && task.attachments.length > 0,
    hasAssignees: task.assignees && task.assignees.length > 0,
  }
}
