'use client'

import { Suspense } from 'react'
import { CalendarPage } from '@/views/calendar'

export const dynamic = 'force-dynamic'

export default function CalendarRoute() {
  return (
    <Suspense
      fallback={
        <div className='text-muted-foreground p-6'>Loading calendar...</div>
      }
    >
      <CalendarPage />
    </Suspense>
  )
}
