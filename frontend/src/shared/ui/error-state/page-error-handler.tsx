import React from 'react'
import { forbidden, notFound, unauthorized } from 'next/navigation'
import { QUERY_ERROR_CODES, type QueryErrorCode } from '@/shared/api'
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
  if (error.code === QUERY_ERROR_CODES.UNAUTHORIZED) {
    unauthorized()
  }

  if (error.code === QUERY_ERROR_CODES.FORBIDDEN) {
    forbidden()
  }

  if (error.code === QUERY_ERROR_CODES.NOT_FOUND) {
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
