import { useMemo } from 'react'
import { toast } from 'sonner'
import { logger } from '@/shared/lib/logger'
import { useGetMembers, useOrgStore } from '@/entities/organization'
import { type Task, useCreateTask, useUpdateTask } from '@/entities/task'
import { type TaskFormValues } from '../model/create-task-schema'
import { mapTaskFormToDto } from '../model/map-form-to-dto'
import { useTaskAttachments } from '../model/use-task-attachments'
import { useTaskForm } from '../model/use-task-form'
import { TaskModalMode } from '../model/use-task-modal-store'
import { TaskForm } from './task-form'

interface ManageTaskFormProps {
  mode: TaskModalMode.CREATE | TaskModalMode.EDIT
  selectedTask: Task | null
  close: () => void
}

export function ManageTaskForm({
  mode,
  selectedTask,
  close,
}: ManageTaskFormProps) {
  const { activeOrgId } = useOrgStore()
  const createTaskMutation = useCreateTask(activeOrgId || '')
  const updateTaskMutation = useUpdateTask(activeOrgId || '')

  const { form } = useTaskForm({ initialTask: selectedTask })
  const { onUpload, onFileReject } = useTaskAttachments()

  const { data: members } = useGetMembers(activeOrgId ?? '')
  const allMembers = useMemo(() => members ?? [], [members])

  const onSubmit = async (values: TaskFormValues) => {
    try {
      if (mode === TaskModalMode.CREATE) {
        const createData = await mapTaskFormToDto(values, TaskModalMode.CREATE)
        const res = await createTaskMutation.mutateAsync(createData)
        if (res) {
          toast.success('Task created successfully')
          close()
        }
      } else {
        if (!selectedTask) return
        const updateData = await mapTaskFormToDto(values, TaskModalMode.EDIT)
        const res = await updateTaskMutation.mutateAsync({
          id: selectedTask.id,
          data: updateData,
        })
        if (res) {
          toast.success('Task updated successfully')
          close()
        }
      }
    } catch (error: unknown) {
      logger.error(error)
      const message =
        error instanceof Error ? error.message : 'Failed to save task'
      toast.error(message)
    }
  }

  return (
    <TaskForm
      form={form}
      onSubmit={onSubmit}
      onCancel={close}
      allMembers={allMembers}
      onFileReject={onFileReject}
      onUpload={onUpload}
      submitText={mode === TaskModalMode.CREATE ? 'Create' : 'Update'}
    />
  )
}
