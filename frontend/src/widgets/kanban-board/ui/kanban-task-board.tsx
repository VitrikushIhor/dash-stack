'use client'

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useOptimistic,
  useTransition,
} from 'react'
import { toast } from 'sonner'
import { Kanban, KanbanBoard, KanbanOverlay } from '@/shared/ui/kanban'
import { type Task, type TaskStatusEnum } from '@/entities/task'
import { updateTaskAction } from '@/features/manage-task/server'
import { KanbanViewMode } from '../model/types/kanban-types'
import { groupTasksByStatus } from '../model/utils'
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

  const [optimisticColumns, setOptimisticColumns] = useOptimistic(
    groupedTask,
    (_state, newColumns: Record<string, Task[]>) => newColumns
  )

  const [dragState, setDragState] = useState<Record<string, Task[]> | null>(
    null
  )
  const dragStartColumnsRef = useRef<Record<string, Task[]> | null>(null)
  const [, startTransition] = useTransition()

  const displayColumns = dragState ?? optimisticColumns

  const handleValueChange = useCallback(
    (newColumns: Record<string, Task[]>) => {
      setDragState(newColumns)
    },
    []
  )

  const handleDragStart = useCallback(() => {
    dragStartColumnsRef.current = displayColumns
  }, [displayColumns])

  const handleDragCancel = useCallback(() => {
    setDragState(null)
    dragStartColumnsRef.current = null
  }, [])

  const handleDragEnd = useCallback(() => {
    const startColumns = dragStartColumnsRef.current
    const currentDragState = dragState

    setDragState(null)
    dragStartColumnsRef.current = null

    if (!startColumns || !currentDragState) return

    let movedTask: Task | null = null
    let targetColumnId: TaskStatusEnum | null = null

    for (const [columnId, newTasks] of Object.entries(currentDragState)) {
      const prevTasks = startColumns[columnId] ?? []

      for (const newTask of newTasks) {
        if (!prevTasks.find((t) => t.id === newTask.id)) {
          movedTask = newTask
          targetColumnId = columnId as TaskStatusEnum
          break
        }
      }
      if (movedTask) break
    }

    if (movedTask && targetColumnId) {
      startTransition(async () => {
        setOptimisticColumns(currentDragState)

        const result = await updateTaskAction({
          id: movedTask!.id,
          data: { status: targetColumnId! },
        })

        if (!result.success) {
          toast.error('Failed to move task')
        }
      })
    }
  }, [dragState, setOptimisticColumns])

  return (
    <>
      {viewMode === KanbanViewMode.Kanban && (
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
            {Object.entries(displayColumns).map(([columnValue, tasks]) => (
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
                const tasks = displayColumns[value] ?? []

                return (
                  <KanbanTaskColum
                    value={value}
                    tasks={tasks}
                    viewMode={viewMode}
                  />
                )
              }

              const task = Object.values(displayColumns)
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
          data-testid='kanban-root'
          value={displayColumns}
          onValueChange={handleValueChange}
          getItemValue={(item) => item.id}
          orientation='vertical'
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {/* <KanbanBoard className='h-[calc(100vh-200px)] overflow-x-auto'> */}
          <KanbanBoard className=''>
            {Object.entries(displayColumns).map(([columnValue, tasks]) => (
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
                const tasks = displayColumns[value] ?? []

                return (
                  <KanbanTaskColum
                    value={value}
                    tasks={tasks}
                    viewMode={viewMode}
                  />
                )
              }

              const task = Object.values(displayColumns)
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
