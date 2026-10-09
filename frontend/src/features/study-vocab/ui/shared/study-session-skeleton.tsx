import React from 'react'
import { StudySessionView } from './study-session-view'

export function StudySessionSkeleton() {
  return (
    <StudySessionView>
      <div className='mx-auto flex w-full max-w-2xl flex-col items-center justify-center space-y-8'>
        {/* Progress Bar Skeleton */}
        <div className='bg-muted h-2 w-full animate-pulse rounded-full' />

        {/* Header Skeleton */}
        <div className='mt-4 flex w-full justify-between'>
          <div className='bg-muted h-5 w-32 animate-pulse rounded-md' />
          <div className='bg-muted h-5 w-24 animate-pulse rounded-md' />
        </div>

        {/* Content Box Skeleton */}
        <div className='bg-muted border-border mt-8 h-64 w-full animate-pulse rounded-xl border shadow-sm' />

        {/* Footer Buttons Skeleton */}
        <div className='mt-12 flex w-full max-w-md gap-4'>
          <div className='bg-muted h-14 flex-1 animate-pulse rounded-xl' />
          <div className='bg-muted h-14 flex-1 animate-pulse rounded-xl' />
        </div>
      </div>
    </StudySessionView>
  )
}
