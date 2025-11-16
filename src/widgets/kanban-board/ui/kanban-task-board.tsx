'use client'

import * as React from 'react'
import { useRef } from 'react'
import {
  Kanban,
  KanbanBoard,
  KanbanOverlay,
} from '@/shared/ui/components/kanban'
import { type Task, type TaskStatusEnum } from '@/entities/task'
import { useTaskStore } from '@/features/task'
import { groupTasksByStatus } from '@/widgets/kanban-board'
import { KanbanTaskCard } from './kanban-task-card'
import { KanbanTaskColum } from './kanban-task-column'

export function KanbanTaskBoard() {
  const tasks = useTaskStore((state) => state.tasks)

  const groupedTask = React.useMemo(() => groupTasksByStatus(tasks), [tasks])

  const [columns, setColumns] =
    React.useState<Record<string, Task[]>>(groupedTask)
  const prevColumnsRef = useRef<Record<string, Task[]>>(groupedTask)

  React.useEffect(() => {
    if (prevColumnsRef.current !== groupedTask) {
      prevColumnsRef.current = groupedTask
      setColumns(groupedTask)
    }
  }, [groupedTask])

  const updateTask = useTaskStore((state) => state.updateTask)

  const handleTaskMove = React.useCallback(
    (taskId: string, newStatus: TaskStatusEnum) => {
      updateTask(taskId, { status: newStatus })
    },
    [updateTask]
  )

  const handleValueChange = React.useCallback(
    (newColumns: Record<string, Task[]>) => {
      const prevColumns = prevColumnsRef.current

      for (const [columnId, newTasks] of Object.entries(newColumns)) {
        const prevTasks = prevColumns[columnId] ?? []

        for (const newTask of newTasks) {
          const prevTask = prevTasks.find((t) => t.id === newTask.id)
          if (!prevTask) {
            const prevColumn = Object.entries(prevColumns).find(([, tasks]) =>
              tasks.some((t) => t.id === newTask.id)
            )?.[0]

            if (prevColumn && prevColumn !== columnId) {
              handleTaskMove(newTask.id, columnId as TaskStatusEnum)
            }
          }
        }
      }

      prevColumnsRef.current = newColumns
      setColumns(newColumns)
    },
    [handleTaskMove]
  )

  return (
    <Kanban
      value={columns}
      onValueChange={handleValueChange}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className='grid auto-rows-fr grid-cols-3'>
        {Object.entries(columns).map(([columnValue, tasks]) => (
          <KanbanTaskColum
            key={columnValue}
            value={columnValue}
            tasks={tasks}
          />
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        {({ value, variant }) => {
          if (variant === 'column') {
            const tasks = columns[value] ?? []

            return <KanbanTaskColum value={value} tasks={tasks} />
          }

          const task = Object.values(columns)
            .flat()
            .find((task) => task.id === value)

          if (!task) return null

          return <KanbanTaskCard task={task} />
        }}
      </KanbanOverlay>
    </Kanban>
  )
}
