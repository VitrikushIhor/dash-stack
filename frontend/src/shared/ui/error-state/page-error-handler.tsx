import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { type QueryErrorCode } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib'
import { ErrorFallback } from './error-fallback'

interface PageErrorHandlerProps {
  error: {
    code: QueryErrorCode
    message: string
  }
  className?: string
  withContainer?: boolean
}

export function PageErrorHandler({
  error,
  className,
  withContainer = true,
}: PageErrorHandlerProps) {
  if (error.code === 'UNAUTHORIZED') {
    redirect(ROUTES.signIn)
  }

  if (error.code === 'NOT_FOUND') {
    notFound()
  }

  const fallback = <ErrorFallback message={error.message} />

  if (withContainer) {
    return (
      <div
        className={cn(
          'container mx-auto max-w-7xl px-4 py-6 sm:px-6',
          className
        )}
      >
        {fallback}
      </div>
    )
  }

  return fallback
}
