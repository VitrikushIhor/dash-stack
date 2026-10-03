'use client'

import { useAction } from '@/shared/lib'
import { deleteTaskAction } from '../server'
import { useTaskSearchParams } from './task-search-params'
import { useTaskQuery } from './use-task-query'

export function useDeleteTaskModal(slug: string) {
  const [{ 'delete-task': deleteId }, setParams] = useTaskSearchParams()
  const { data, isFetching, isError, error, refetch } = useTaskQuery(
    slug,
    deleteId
  )
  const selectedTask = data ?? null

  const close = () => {
    setParams({ 'delete-task': null })
  }

  const { execute: executeDelete } = useAction(deleteTaskAction, {
    successMessage: 'Task deleted successfully',
    onSuccess: close,
  })

  const handleDelete = async () => {
    if (!selectedTask) return
    await executeDelete({ slug, id: selectedTask.id })
  }

  return {
    isOpen: !!deleteId,
    selectedTask,
    isFetching,
    isError,
    error,
    refetch,
    handleDelete,
  }
}
