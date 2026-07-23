'use client'

import { useState } from 'react'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { toast } from 'sonner'
import { clearTokens } from '@/shared/api'
import { handleServerError } from '@/shared/lib/handle-server-error'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const queryCache = new QueryCache({
      onError: (error: unknown) => {
        const err = error as { response?: { status?: number } }
        if (err?.response?.status === 401) {
          toast.error('Session expired!')
          clearTokens()
          queryCache.clear()
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/sign-in')
          ) {
            window.location.href = '/sign-in'
          }
        }
      },
    })

    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: (_failureCount) => {
            if (process.env.NODE_ENV === 'development') return false
            return _failureCount <= 3
          },
          refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          staleTime: 10 * 1000,
        },
        mutations: {
          onError: handleServerError,
        },
      },
      queryCache,
    })
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools buttonPosition='bottom-left' />
      )}
    </QueryClientProvider>
  )
}
