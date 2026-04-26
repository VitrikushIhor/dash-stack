import { toast } from 'sonner'
import { ConfirmDialog } from '@/shared/ui/components/confirm-dialog'
import { useOrgStore } from '@/features/organization'
import {
  AddTaskDialog,
  EditTaskDialog,
  useTasks,
  useDeleteTask,
} from '@/features/task'

export function TasksDialogs() {
  const { activeOrgId } = useOrgStore()
  const { open, setOpen, currentRow, setCurrentRow, status } = useTasks()
  // deleteTask is a mutation hook, not from store
  const deleteTaskMutation = useDeleteTask(activeOrgId || '')
  return (
    <>
      <AddTaskDialog
        open={open === 'create'}
        onOpenChange={(open) => {
          setOpen(open ? 'create' : null)
        }}
        status={status}
      />

      {currentRow && (
        <>
          <EditTaskDialog
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            task={currentRow}
          />

          <ConfirmDialog
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              if (currentRow) {
                deleteTaskMutation.mutate(currentRow.id)
              }
              toast.success('Task deleted successfully')
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            className='max-w-md'
            title={`Delete this task: ${currentRow.title} ?`}
            desc={
              <>
                Are you sure you want to delete{' '}
                <strong>{currentRow.title}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
