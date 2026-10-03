'use client'

import { type Membership } from '@/shared/model'
import { type Label } from '@/entities/label'
import { type Task } from '@/entities/task'
import { ManageTaskMode } from '../model/types'
import { useManageTaskForm } from '../model/use-manage-task-form'
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
  const { form, onSubmit, onUpload, onFileReject } = useManageTaskForm({
    slug,
    mode,
    selectedTask,
    close,
  })

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
