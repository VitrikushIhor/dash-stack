import React from 'react'
import { Loader2 } from 'lucide-react'

interface StudySavingStateProps {
  title?: string
  description?: string
}

export function StudySavingState({
  title = 'Saving Result...',
  description = 'Processing your session score.',
}: StudySavingStateProps) {
  return (
    <div className='flex min-h-150 w-full flex-col items-center justify-center p-8'>
      <Loader2 className='text-primary mb-4 h-10 w-10 animate-spin' />
      <h3 className='text-xl font-semibold'>{title}</h3>
      <p className='text-muted-foreground mt-2'>{description}</p>
    </div>
  )
}
