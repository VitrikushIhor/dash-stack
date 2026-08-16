'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { ErrorState } from '@/shared/ui/error-state'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // TODO: Send to observability platform Sentry
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error.message, error.digest)
  }, [error])

  return (
    <ErrorState
      statusCode='500'
      title="Oops! Something went wrong :')"
      description={
        <>
          We apologize for the inconvenience. <br /> Please try again later.
        </>
      }
    >
      <Button onClick={() => reset()}>Try Again</Button>
      <Button variant='outline' asChild>
        <Link href={ROUTES.home}>Back to Home</Link>
      </Button>
    </ErrorState>
  )
}
