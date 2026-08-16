'use client'

import { Loader2 } from 'lucide-react'
import { useAction } from '@/shared/lib/hooks/use-action'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { useTaskSearchParams } from '../model/task-search-params'
import { useTaskQuery } from '../model/use-task-query'
import { deleteTaskAction } from '../server'

export const DeleteTaskModal = () => {
  const [{ 'delete-task': deleteId }, setParams] = useTaskSearchParams()

  const isOpen = !!deleteId

  const { data: fetchedTask, isLoading } = useTaskQuery(deleteId)
  const selectedTask = deleteId ? (fetchedTask ?? null) : null

  const close = () => {
    setParams({
      'delete-task': null,
    })
  }

  const { execute: executeDelete } = useAction(deleteTaskAction, {
    successMessage: 'Task deleted successfully',
    onSuccess: () => close(),
  })

  const handleDelete = async () => {
    if (!selectedTask) return
    await executeDelete({ id: selectedTask.id })
  }

  return (
    <ConfirmDialog
      destructive
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      handleConfirm={handleDelete}
      className='max-w-md'
      title={
        isLoading
          ? 'Loading task...'
          : `Delete this task: ${selectedTask?.title} ?`
      }
      desc={
        isLoading ? (
          <div className='flex items-center justify-center p-8'>
            <Loader2 className='text-primary h-8 w-8 animate-spin' />
          </div>
        ) : (
          <>
            Are you sure you want to delete{' '}
            <strong>{selectedTask?.title}</strong>? <br />
            This action cannot be undone.
          </>
        )
      }
      confirmText='Delete'
    />
  )
}
