'use client'

import { useAction } from '@/shared/lib/hooks/use-action'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { type Task } from '@/entities/task'
import { useTaskSearchParams } from '../model/task-search-params'
import { deleteTaskAction } from '../server'

interface DeleteTaskModalProps {
  tasks: Task[]
}

export const DeleteTaskModal = ({ tasks }: DeleteTaskModalProps) => {
  const [{ 'delete-task': deleteId }, setParams] = useTaskSearchParams()

  const isOpen = !!deleteId
  const selectedTask = deleteId
    ? (tasks.find((t) => t.id === deleteId) ?? null)
    : null

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
      title={`Delete this task: ${selectedTask?.title} ?`}
      desc={
        <>
          Are you sure you want to delete <strong>{selectedTask?.title}</strong>
          ? <br />
          This action cannot be undone.
        </>
      }
      confirmText='Delete'
    />
  )
}
