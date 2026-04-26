'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Kanban,
  KanbanBoard,
  KanbanOverlay,
} from '@/shared/ui/components/kanban'
import { type Task, type TaskStatusEnum } from '@/entities/task'
import { useOrgStore } from '@/features/organization'
import { useUpdateTask } from '@/features/task'
import { groupTasksByStatus, KanbanViewMode } from '@/widgets/kanban-board'
import { KanbanTaskCard } from './kanban-task-card'
import { KanbanTaskColum } from './kanban-task-column'

export function KanbanTaskBoard({
  viewMode,
  tasks,
}: {
  viewMode: KanbanViewMode
  tasks: Task[]
}) {
  const groupedTask = useMemo(() => groupTasksByStatus(tasks), [tasks])

  const [columns, setColumns] = useState<Record<string, Task[]>>(groupedTask)
  const prevColumnsRef = useRef<Record<string, Task[]>>(groupedTask)

  useEffect(() => {
    if (prevColumnsRef.current !== groupedTask) {
      prevColumnsRef.current = groupedTask
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColumns(groupedTask)
    }
  }, [groupedTask])

  const { activeOrgId } = useOrgStore()
  const { mutate: updateTask } = useUpdateTask(activeOrgId || '')

  const handleTaskMove = useCallback(
    (taskId: string, newStatus: TaskStatusEnum) => {
      updateTask({ id: taskId, data: { status: newStatus } })
    },
    [updateTask]
  )

  const handleValueChange = useCallback(
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
    <>
      {viewMode === KanbanViewMode.Kanban && (
        <Kanban
          value={columns}
          onValueChange={handleValueChange}
          getItemValue={(item) => item.id}
          orientation='horizontal'
        >
          <KanbanBoard className='grid auto-rows-fr grid-cols-3'>
            {Object.entries(columns).map(([columnValue, tasks]) => (
              <KanbanTaskColum
                key={columnValue}
                value={columnValue}
                tasks={tasks}
                viewMode={viewMode}
              />
            ))}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value, variant }) => {
              if (variant === 'column') {
                const tasks = columns[value] ?? []

                return (
                  <KanbanTaskColum
                    value={value}
                    tasks={tasks}
                    viewMode={viewMode}
                  />
                )
              }

              const task = Object.values(columns)
                .flat()
                .find((task) => task.id === value)

              if (!task) return null

              return <KanbanTaskCard task={task} viewMode={viewMode} />
            }}
          </KanbanOverlay>
        </Kanban>
      )}

      {viewMode === KanbanViewMode.List && (
        <Kanban
          value={columns}
          onValueChange={handleValueChange}
          getItemValue={(item) => item.id}
          orientation='vertical'
        >
          {/* <KanbanBoard className='h-[calc(100vh-200px)] overflow-x-auto'> */}
          <KanbanBoard className=''>
            {Object.entries(columns).map(([columnValue, tasks]) => (
              <KanbanTaskColum
                key={columnValue}
                value={columnValue}
                tasks={tasks}
                viewMode={viewMode}
              />
            ))}
          </KanbanBoard>

          <KanbanOverlay>
            {({ value, variant }) => {
              if (variant === 'column') {
                const tasks = columns[value] ?? []

                return (
                  <KanbanTaskColum
                    value={value}
                    tasks={tasks}
                    viewMode={viewMode}
                  />
                )
              }

              const task = Object.values(columns)
                .flat()
                .find((task) => task.id === value)

              if (!task) return null

              return <KanbanTaskCard task={task} viewMode={viewMode} />
            }}
          </KanbanOverlay>
        </Kanban>
      )}
    </>
  )
}
