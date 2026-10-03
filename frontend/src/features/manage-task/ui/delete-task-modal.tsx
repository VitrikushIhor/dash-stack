'use client'

import { getErrorMessage } from '@/shared/api'
import { useAction } from '@/shared/lib'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { WidgetErrorState } from '@/shared/ui/feedback'
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

  const {
    data: fetchedTask,
    isFetching,
    isError,
    error,
    refetch,
  } = useTaskQuery(slug, deleteId)
  const selectedTask = fetchedTask ?? null

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
      disabled={isFetching || isError || !selectedTask?.title}
      handleConfirm={handleDelete}
      className='max-w-md'
      confirmText='Delete'
    >
      <UrlConfirmDialog.Header>
        <UrlConfirmDialog.Title>Delete task</UrlConfirmDialog.Title>
        <UrlConfirmDialog.Description>
          {isFetching ? (
            <div className='space-y-3 py-2' aria-busy='true'>
              <Skeleton className='h-4 w-4/5' />
              <Skeleton className='h-4 w-2/3' />
            </div>
          ) : isError || !selectedTask?.title ? (
            <WidgetErrorState
              size='compact'
              title='Could not load task'
              description={getErrorMessage(
                error ?? 'This task is unavailable. It may have been deleted.'
              )}
              onRetry={() => void refetch()}
              className='rounded-md p-2'
            />
          ) : (
            <>
              Are you sure you want to delete{' '}
              <strong>{selectedTask.title}</strong>?
              <br />
              This action cannot be undone.
            </>
          )}
        </UrlConfirmDialog.Description>
      </UrlConfirmDialog.Header>
    </UrlConfirmDialog.Root>
  )
}
