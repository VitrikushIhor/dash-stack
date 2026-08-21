'use client'

import { toast } from 'sonner'
import { logger, useAction, useAttachments } from '@/shared/lib'
import { type Membership } from '@/shared/model'
import { type Label } from '@/entities/label'
import { type Task, type TaskStatusEnum } from '@/entities/task'
import { type TaskFormValues } from '../model/create-task-schema'
import { mapTaskFormToDto } from '../model/map-form-to-dto'
import { useTaskSearchParams } from '../model/task-search-params'
import { ManageTaskMode } from '../model/types'
import { useTaskForm } from '../model/use-task-form'
import { createTaskAction, updateTaskAction } from '../server'
import { TaskForm } from './task-form'

interface ManageTaskFormProps {
  slug: string
  mode: ManageTaskMode
  selectedTask: Task | null
  close: () => void
  labels: Label[]
  members: Membership[]
}

export function ManageTaskForm({
  slug,
  mode,
  selectedTask,
  close,
  labels,
  members,
}: ManageTaskFormProps) {
  const { execute: executeCreate } = useAction(createTaskAction, {
    successMessage: 'Task created successfully',
    onSuccess: () => close(),
  })

  const { execute: executeUpdate } = useAction(updateTaskAction, {
    successMessage: 'Task updated successfully',
    onSuccess: () => close(),
  })

  const [{ 'task-status': initialStatus }] = useTaskSearchParams()

  const { form } = useTaskForm({
    initialTask: selectedTask,
    initialStatus: initialStatus as TaskStatusEnum | null,
  })
  const { onUpload, onFileReject } = useAttachments()

  const onSubmit = async (values: TaskFormValues) => {
    try {
      if (mode === ManageTaskMode.CREATE) {
        const createData = mapTaskFormToDto(values, ManageTaskMode.CREATE)
        await executeCreate({ slug, data: createData })
      } else {
        if (!selectedTask) return
        const updateData = mapTaskFormToDto(values, ManageTaskMode.EDIT)
        await executeUpdate({
          slug,
          id: selectedTask.id,
          data: updateData,
        })
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
      allMembers={members}
      availableLabels={labels}
      onFileReject={onFileReject}
      onUpload={onUpload}
      submitText={mode === ManageTaskMode.CREATE ? 'Create' : 'Update'}
    />
  )
}
