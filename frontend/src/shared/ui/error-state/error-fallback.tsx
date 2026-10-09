'use client'

import React from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'

interface ErrorFallbackProps {
  message?: string
  reset?: () => void
  title?: string
}

export function ErrorFallback({
  message = 'An unexpected error occurred.',
  reset,
  title = 'Something went wrong',
}: ErrorFallbackProps) {
  return (
    <div className='border-destructive/20 bg-destructive/5 flex min-h-100 flex-col items-center justify-center space-y-4 rounded-xl border border-dashed p-8 text-center'>
      <div className='bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full'>
        <AlertCircle className='text-destructive h-6 w-6' />
      </div>
      <div className='space-y-1.5'>
        <h3 className='text-lg font-semibold'>{title}</h3>
        <p className='text-muted-foreground max-w-125 text-sm'>{message}</p>
      </div>
      {reset && (
        <Button
          variant='outline'
          onClick={reset}
          className='text-destructive hover:bg-destructive/10 hover:text-destructive mt-4 gap-2'
        >
          <RefreshCcw className='h-4 w-4' />
          Try Again
        </Button>
      )}
    </div>
  )
}
