import { TaskStatusEnum } from '@/entities/task'

export const TASK_STATUS_COLORS: Record<TaskStatusEnum, string> = {
  [TaskStatusEnum.COMPLETED]: '#39C682',
  [TaskStatusEnum.PLANNED]: '#B1AB1D',
  [TaskStatusEnum.UPCOMING]: '#5A8FF5',
}

export const TASK_COLUMN_TITLES: Record<string, string> = {
  PLANNED: 'Planned',
  UPCOMING: 'Upcoming',
  COMPLETED: 'Completed',
}
