'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/ui/core/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Global Error Boundary caught:', error)
  }, [error])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 text-center'>
      <h1 className='text-destructive text-4xl font-bold'>
        Something went wrong!
      </h1>
      <p className='text-muted-foreground'>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
