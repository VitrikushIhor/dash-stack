'use client'

import { type Membership } from '@/shared/model'
import { type Label } from '@/entities/label'
import { type Task } from '@/entities/task'
import { useTaskSearchParams } from '../model/task-search-params'
import { ManageTaskMode } from '../model/types'
import { ManageTaskForm } from './manage-task-form'
import { TaskModalView } from './task-modal-view'

interface ManageTaskModalProps {
  tasks: Task[]
  labels: Label[]
  members: Membership[]
}

export const ManageTaskModal = ({
  tasks,
  labels,
  members,
}: ManageTaskModalProps) => {
  const [{ 'create-task': create, 'update-task': updateId }, setParams] =
    useTaskSearchParams()

  const isCreate = create === true
  const isUpdate = !!updateId
  const isOpen = isCreate || isUpdate

  const selectedTaskId = updateId
  const selectedTask = selectedTaskId
    ? (tasks.find((t) => t.id === selectedTaskId) ?? null)
    : null

  const close = () => {
    setParams({
      'create-task': null,
      'update-task': null,
    })
  }

  return (
    <TaskModalView
      title={isCreate ? 'Create Task' : 'Edit Task'}
      open={isOpen}
      onOpenChange={(open) => !open && close()}
    >
      <ManageTaskForm
        key={`${isCreate ? ManageTaskMode.CREATE : ManageTaskMode.EDIT}-${selectedTask?.id || 'new'}-${isOpen}`}
        mode={isCreate ? ManageTaskMode.CREATE : ManageTaskMode.EDIT}
        selectedTask={selectedTask}
        close={close}
        labels={labels}
        members={members}
      />
    </TaskModalView>
  )
}
