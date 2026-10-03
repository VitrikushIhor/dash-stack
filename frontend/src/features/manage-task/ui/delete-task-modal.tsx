'use client'

import { getErrorMessage } from '@/shared/api'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { WidgetErrorState } from '@/shared/ui/feedback'
import { UrlConfirmDialog } from '@/shared/ui/url-confirm-dialog'
import { useDeleteTaskModal } from '../model/use-delete-task-modal'

interface DeleteTaskModalProps {
  slug: string
}

export const DeleteTaskModal = ({ slug }: DeleteTaskModalProps) => {
  const {
    isOpen,
    selectedTask,
    isFetching,
    isError,
    error,
    refetch,
    handleDelete,
  } = useDeleteTaskModal(slug)

  const isShowErrorState = !isFetching && (isError || !selectedTask?.title)

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
          {isFetching && (
            <div className='space-y-3 py-2' aria-busy='true'>
              <Skeleton className='h-4 w-4/5' />
              <Skeleton className='h-4 w-2/3' />
            </div>
          )}
          {isShowErrorState ? (
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
            !isFetching &&
            selectedTask?.title && (
              <>
                Are you sure you want to delete{' '}
                <strong>{selectedTask.title}</strong>?
                <br />
                This action cannot be undone.
              </>
            )
          )}
        </UrlConfirmDialog.Description>
      </UrlConfirmDialog.Header>
    </UrlConfirmDialog.Root>
  )
}
