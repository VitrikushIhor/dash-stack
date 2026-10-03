import { type Task } from '@/entities/task'

export interface CalendarViewProps {
  tasks: Task[]
  selectedDate: Date
  onTaskClick?: (taskId: string) => void
}
