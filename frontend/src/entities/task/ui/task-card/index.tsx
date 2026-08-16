import { type TaskViewMode } from '../../model/types'
import { TaskCardKanban } from './task-card-kanban'
import { TaskCardList, type TaskCardProps } from './task-card-list'

interface TaskCardWrapperProps extends TaskCardProps {
  viewMode?: TaskViewMode
}

export const TaskCard = ({ viewMode, ...props }: TaskCardWrapperProps) => {
  if (viewMode === 'list') {
    return <TaskCardList {...props} />
  }
  return <TaskCardKanban {...props} />
}

export { TaskCardList, TaskCardKanban }
