import { toast } from 'sonner'
import { ConfirmDialog } from '@/shared/ui'
import { useDeleteTask } from '@/entities/task'
import { useOrgStore } from '@/features/organization'
import { useTaskModalStore, TaskModalMode } from '../model/use-task-modal-store'
import { ManageTaskForm } from './manage-task-form'
import { TaskModalView } from './task-modal-view'

export const ManageTaskModal = () => {
  const { isOpen, mode, selectedTask, close } = useTaskModalStore()
  const { activeOrgId } = useOrgStore()
  const deleteTaskMutation = useDeleteTask(activeOrgId || '')

  const handleDelete = async () => {
    if (!selectedTask || !activeOrgId) return
    toast.promise(deleteTaskMutation.mutateAsync(selectedTask.id), {
      loading: 'Deleting task...',
      success: 'Task deleted successfully',
      error: 'Failed to delete task',
    })
    close()
  }

  if (mode === TaskModalMode.DELETE) {
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
            Are you sure you want to delete{' '}
            <strong>{selectedTask?.title}</strong>? <br />
            This action cannot be undone.
          </>
        }
        confirmText='Delete'
      />
    )
  }

  return (
    <TaskModalView
      title={mode === TaskModalMode.CREATE ? 'Create Task' : 'Edit Task'}
      open={isOpen}
      onOpenChange={(open) => !open && close()}
    >
      <ManageTaskForm
        key={`${mode}-${selectedTask?.id || selectedTask?.status || 'new'}-${isOpen}`}
        mode={mode as TaskModalMode.CREATE | TaskModalMode.EDIT}
        selectedTask={selectedTask}
        close={close}
      />
    </TaskModalView>
  )
}
