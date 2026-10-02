'use client'

import { Loader2 } from 'lucide-react'
import { useAction } from '@/shared/lib'
import { UrlConfirmDialog } from '@/shared/ui/url-confirm-dialog'
import { useTaskSearchParams } from '../model/task-search-params'
import { useTaskQuery } from '../model/use-task-query'
import { deleteTaskAction } from '../server'

interface DeleteTaskModalProps {
  slug: string
}

export const DeleteTaskModal = ({ slug }: DeleteTaskModalProps) => {
  const [{ 'delete-task': deleteId }, setParams] = useTaskSearchParams()

  const isOpen = !!deleteId

  const { data: fetchedTask, isLoading } = useTaskQuery(slug, deleteId)
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
    await executeDelete({ slug, id: selectedTask.id })
  }

  return (
    <UrlConfirmDialog.Root
      queryKey='delete-task'
      destructive
      enabled={isOpen}
      disabled={isLoading || !selectedTask}
      handleConfirm={handleDelete}
      className='max-w-md'
      confirmText='Delete'
    >
      <UrlConfirmDialog.Header>
        <UrlConfirmDialog.Title>
          {isLoading
            ? 'Loading task...'
            : `Delete this task: ${selectedTask?.title} ?`}
        </UrlConfirmDialog.Title>
        <UrlConfirmDialog.Description>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
            </div>
          ) : (
            <>
              Are you sure you want to delete{' '}
              <strong>{selectedTask?.title}</strong>
              ?
              <br />
              This action cannot be undone.
            </>
          )}
        </UrlConfirmDialog.Description>
      </UrlConfirmDialog.Header>
    </UrlConfirmDialog.Root>
  )
}
