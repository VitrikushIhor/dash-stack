import { Calendar, CheckCircle2, Clock } from 'lucide-react'
import { TaskStatusEnum } from './types'

export const STATUS_CONFIG = {
  [TaskStatusEnum.PLANNED]: {
    label: 'Planned',
    value: TaskStatusEnum.PLANNED,
    variant: 'secondary' as const,
    icon: Calendar,
    color: '#B1AB1D',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  [TaskStatusEnum.UPCOMING]: {
    label: 'Upcoming',
    value: TaskStatusEnum.UPCOMING,
    variant: 'default' as const,
    icon: Clock,
    color: '#5A8FF5',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  [TaskStatusEnum.COMPLETED]: {
    label: 'Completed',
    value: TaskStatusEnum.COMPLETED,
    variant: 'outline' as const,
    icon: CheckCircle2,
    color: '#39C682',
    className:
      'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  },
} as const
