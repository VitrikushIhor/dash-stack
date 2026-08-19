'use client'

import { Kanban, KanbanBoard, KanbanOverlay } from '@/shared/ui/kanban'
import { type Task, TaskViewMode } from '@/entities/task'
import { useTaskBoard } from '../model/use-task-board'
import { TaskBoardCard } from './task-board-card'
import { TaskBoardColumn } from './task-board-column'

interface TaskBoardListProps {
  slug?: string
  tasks: Task[]
}

export function TaskBoardList({ slug, tasks }: TaskBoardListProps) {
  const {
    displayColumns,
    handleValueChange,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useTaskBoard(tasks, slug)

  return (
    <Kanban
      data-testid='kanban-root'
      value={displayColumns}
      onValueChange={handleValueChange}
      getItemValue={(item) => item.id}
      orientation='vertical'
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <KanbanBoard className=''>
        {Object.entries(displayColumns).map(([columnValue, columnTasks]) => (
          <TaskBoardColumn
            key={columnValue}
            value={columnValue}
            tasks={columnTasks}
            viewMode={TaskViewMode.List}
          />
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        {({ value, variant }) => {
          if (variant === 'column') {
            const columnTasks = displayColumns[value] ?? []

            return (
              <TaskBoardColumn
                value={value}
                tasks={columnTasks}
                viewMode={TaskViewMode.List}
              />
            )
          }

          const task = Object.values(displayColumns)
            .flat()
            .find((t) => t.id === value)

          if (!task) return null

          return <TaskBoardCard task={task} viewMode={TaskViewMode.List} />
        }}
      </KanbanOverlay>
    </Kanban>
  )
}
