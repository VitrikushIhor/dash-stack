import { TaskCardKanban } from './task-card-kanban'
import { TaskCardList, type TaskCardProps } from './task-card-list'

export const TaskCard = (props: TaskCardProps) => {
  if (props.viewMode === 'list') {
    return <TaskCardList {...props} />
  }
  return <TaskCardKanban {...props} />
}

export { TaskCardList, TaskCardKanban }
export type { TaskCardProps }
