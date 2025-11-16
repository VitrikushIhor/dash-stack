import { useMemo } from 'react'
import { cn } from '@/shared/lib/utils'
import { type Task, TaskStatusEnum } from '@/entities/task'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick?: (taskId: string) => void
  onTaskMove?: (taskId: string, newStatus: TaskStatusEnum) => void
  className?: string
}

interface ColumnConfig {
  id: TaskStatusEnum
  title: string
  color: string
}

const COLUMNS: ColumnConfig[] = [
  {
    id: TaskStatusEnum.PLANNED,
    title: 'Planned',
    color: '#B1AB1D',
  },
  {
    id: TaskStatusEnum.UPCOMING,
    title: 'Upcoming',
    color: '#6884FD',
  },
  {
    id: TaskStatusEnum.COMPLETED,
    title: 'Completed',
    color: '#39C682',
  },
]

export const KanbanBoard = ({
  tasks,
  onTaskClick,
  onTaskMove,
  className,
}: KanbanBoardProps) => {
  const tasksByStatus = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = []
        }
        acc[task.status].push(task)
        return acc
      },
      {} as Record<TaskStatusEnum, Task[]>
    )
  }, [tasks])

  const getTaskCount = (status: TaskStatusEnum) => {
    return tasksByStatus[status]?.length || 0
  }

  const getOpenTaskCount = (status: TaskStatusEnum) => {
    const statusTasks = tasksByStatus[status] || []
    return statusTasks.filter((task) => !task.status).length
  }

  return (
    <div className={cn('flex h-full gap-4 overflow-x-auto pb-4', className)}>
      {COLUMNS.map((column) => {
        const columnTasks = tasksByStatus[column.id] || []
        const openTaskCount = getOpenTaskCount(column.id)

        return (
          <KanbanColumn
            key={column.id}
            title={column.title}
            status={column.id}
            color={column.color}
            tasks={columnTasks}
            taskCount={getTaskCount(column.id)}
            openTaskCount={openTaskCount}
            onTaskClick={onTaskClick}
            onTaskMove={onTaskMove}
          />
        )
      })}
    </div>
  )
}
