'use client'

import { Kanban, KanbanBoard, KanbanOverlay } from '@/shared/ui/kanban'
import { type Task, TaskViewMode } from '@/entities/task'
import { useTaskBoard } from '../model/use-task-board'
import { TaskBoardCard } from './task-board-card'
import { TaskBoardColumn } from './task-board-column'

interface TaskBoardKanbanProps {
  tasks: Task[]
}

export function TaskBoardKanban({ tasks }: TaskBoardKanbanProps) {
  const {
    displayColumns,
    handleValueChange,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useTaskBoard(tasks)

  return (
    <Kanban
      data-testid='kanban-root'
      value={displayColumns}
      onValueChange={handleValueChange}
      getItemValue={(item) => item.id}
      orientation='horizontal'
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <KanbanBoard className='grid auto-rows-fr grid-cols-3'>
        {Object.entries(displayColumns).map(([columnValue, columnTasks]) => (
          <TaskBoardColumn
            key={columnValue}
            value={columnValue}
            tasks={columnTasks}
            viewMode={TaskViewMode.Kanban}
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
                viewMode={TaskViewMode.Kanban}
              />
            )
          }

          const task = Object.values(displayColumns)
            .flat()
            .find((t) => t.id === value)

          if (!task) return null

          return <TaskBoardCard task={task} viewMode={TaskViewMode.Kanban} />
        }}
      </KanbanOverlay>
    </Kanban>
  )
}
