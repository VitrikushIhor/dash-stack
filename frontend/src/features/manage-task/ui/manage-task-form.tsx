import { useMemo } from 'react'
import { toast } from 'sonner'
import {
  type Task,
  type UpdateTaskDto,
  useCreateTask,
  useUpdateTask,
  type TaskFormValues,
} from '@/entities/task'
import { useGetMembers, useOrgStore } from '@/features/organization'
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
    if (mode === TaskModalMode.CREATE && !values.label) {
      toast.error('Label is required')
      return
    }

    try {
      const baseData = await mapTaskFormToDto(values)

      if (mode === TaskModalMode.CREATE) {
        const res = await createTaskMutation.mutateAsync(baseData)
        if (res) {
          toast.success('Task created successfully')
          close()
        }
      } else {
        if (!selectedTask) return
        const res = await updateTaskMutation.mutateAsync({
          id: selectedTask.id,
          data: baseData as UpdateTaskDto,
        })
        if (res) {
          toast.success('Task updated successfully')
          close()
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
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
