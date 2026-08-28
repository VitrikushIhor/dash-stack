import React from 'react'
import { AlertCircle } from 'lucide-react'

interface StudyEmptyStateProps {
  title?: string
  description?: string
}

export function StudyEmptyState({
  title = 'No Cards Available',
  description = 'There are no cards available for this study session.',
}: StudyEmptyStateProps) {
  return (
    <div className='flex min-h-150 w-full items-center justify-center p-4'>
      <div className='bg-card border-border flex max-w-md flex-col items-center rounded-xl border p-8 text-center shadow-sm'>
        <AlertCircle className='text-muted-foreground mb-4 h-12 w-12' />
        <h3 className='mb-2 text-xl font-bold'>{title}</h3>
        <p className='text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}
