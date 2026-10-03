'use client'

import { toast } from 'sonner'
import { logger, useAction, useAttachments } from '@/shared/lib'
import { type Task, TaskStatusEnum } from '@/entities/task'
import { createTaskAction, updateTaskAction } from '../server'
import { mapTaskFormToDto } from './map-form-to-dto'
import { type TaskFormValues } from './task-form.schema'
import { useTaskSearchParams } from './task-search-params'
import { type ManageTaskMode, ManageTaskMode as Mode } from './types'
import { useTaskForm } from './use-task-form'

interface UseManageTaskFormOptions {
  slug: string
  mode: ManageTaskMode
  selectedTask: Task | null
  close: () => void
}

export function useManageTaskForm({
  slug,
  mode,
  selectedTask,
  close,
}: UseManageTaskFormOptions) {
  const { execute: executeCreate } = useAction(createTaskAction, {
    successMessage: 'Task created successfully',
    onSuccess: close,
  })
  const { execute: executeUpdate } = useAction(updateTaskAction, {
    successMessage: 'Task updated successfully',
    onSuccess: close,
  })

  const [{ 'task-status': initialStatus }] = useTaskSearchParams()
  const validInitialStatus =
    Object.values(TaskStatusEnum).find((status) => status === initialStatus) ??
    null
  const { form } = useTaskForm({
    initialTask: selectedTask,
    initialStatus: validInitialStatus,
  })
  const { onUpload, onFileReject } = useAttachments()

  const onSubmit = async (values: TaskFormValues) => {
    try {
      if (mode === Mode.CREATE) {
        const data = mapTaskFormToDto(values, Mode.CREATE)
        await executeCreate({ slug, data })
      } else {
        if (!selectedTask) return
        const data = mapTaskFormToDto(values, Mode.EDIT)
        await executeUpdate({ slug, id: selectedTask.id, data })
      }
    } catch (error: unknown) {
      logger.error(error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to save task'
      )
    }
  }

  return { form, onSubmit, onUpload, onFileReject }
}
