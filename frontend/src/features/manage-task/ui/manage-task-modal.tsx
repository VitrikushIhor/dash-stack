'use client'

import { Loader2 } from 'lucide-react'
import { type Membership } from '@/shared/model'
import { type Label } from '@/entities/label'
import { useTaskSearchParams } from '../model/task-search-params'
import { ManageTaskMode } from '../model/types'
import { useTaskQuery } from '../model/use-task-query'
import { ManageTaskForm } from './manage-task-form'
import { TaskModalView } from './task-modal-view'

interface ManageTaskModalProps {
  slug: string
  labels: Label[]
  members: Membership[]
}

export const ManageTaskModal = ({
  slug,
  labels,
  members,
}: ManageTaskModalProps) => {
  const [{ 'create-task': create, 'update-task': updateId }, setParams] =
    useTaskSearchParams()

  const isCreate = create === true
  const isOpen = !!updateId || isCreate

  const { data: fetchedTask, isLoading } = useTaskQuery(slug, updateId || null)

  const selectedTask = updateId ? (fetchedTask ?? null) : null

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
      {isLoading && !!updateId ? (
        <div className='flex items-center justify-center p-8'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
        </div>
      ) : (
        <ManageTaskForm
          key={`${isCreate ? ManageTaskMode.CREATE : ManageTaskMode.EDIT}-${selectedTask?.id || 'new'}-${isOpen}`}
          slug={slug}
          mode={isCreate ? ManageTaskMode.CREATE : ManageTaskMode.EDIT}
          selectedTask={selectedTask}
          close={close}
          labels={labels}
          members={members}
        />
      )}
    </TaskModalView>
  )
}
