import { toast } from 'sonner'
import { ConfirmDialog } from '@/shared/ui/components/confirm-dialog'
import {
  AddTaskDialog,
  EditTaskDialog,
  useTaskStore,
  useTasks,
} from '@/features/task'

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, status } = useTasks()
  const { deleteTask } = useTaskStore()
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
              deleteTask(currentRow.id)
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
