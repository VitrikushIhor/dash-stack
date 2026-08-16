'use client'

import { useEffect } from 'react'
import { Inter } from 'next/font/google'
import '@/shared/styles/index.css'
import { Button } from '@/shared/ui/core/button'
import { ErrorState } from '@/shared/ui/error-state'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // TODO: Send to observability platform (e.g., Sentry)
    // eslint-disable-next-line no-console
    console.error('[GlobalError]', error.message, error.digest)
  }, [error])

  return (
    <html lang='en'>
      <body className={inter.className}>
        <ErrorState
          statusCode='500'
          title='Something went wrong'
          description='An unexpected error occurred. Please try again later.'
        >
          <Button variant='outline' onClick={() => reset()}>
            Try Again
          </Button>
        </ErrorState>
      </body>
    </html>
  )
}
