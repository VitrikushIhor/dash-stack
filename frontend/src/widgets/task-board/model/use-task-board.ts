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
import { type Task, type TaskStatusEnum } from '@/entities/task'
import { updateTaskAction } from '@/features/manage-task/server'
import { groupTasksByStatus } from './utils'

export function useTaskBoard(tasks: Task[]) {
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
          setOptimisticColumns(startColumns)
          toast.error('Failed to move task')
        }
      })
    }
  }, [dragState, setOptimisticColumns])

  return {
    displayColumns,
    handleValueChange,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}
