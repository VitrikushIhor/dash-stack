'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { useTaskSearchParams } from '@/features/manage-task/model/task-search-params'

export function TaskHeaderActions() {
  const [, setTaskParams] = useTaskSearchParams()

  return (
    <Button onClick={() => setTaskParams({ 'create-task': true })} size='sm'>
      <Plus className='mr-2 h-4 w-4' /> Add task
    </Button>
  )
}
