'use client'

import { Suspense } from 'react'
import { TaskPage } from '@/views/task'

export const dynamic = 'force-dynamic'

export default function TaskRoute() {
  return (
    <Suspense
      fallback={
        <div className='text-muted-foreground p-6'>Loading tasks...</div>
      }
    >
      <TaskPage />
    </Suspense>
  )
}
