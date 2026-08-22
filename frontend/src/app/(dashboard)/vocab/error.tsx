'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/shared/ui/error-state'

export default function VocabError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    // eslint-disable-next-line no-console
    console.error('[Vocab Error Boundary]', error)
  }, [error])

  return (
    <div className='container mx-auto flex min-h-[50vh] items-center justify-center p-4'>
      <div className='w-full max-w-lg'>
        <ErrorFallback
          title='Something went wrong in Vocabulary'
          message='An unexpected error occurred while loading this page. Please try again or contact support if the issue persists.'
          reset={reset}
        />
      </div>
    </div>
  )
}
