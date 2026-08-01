'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { handleServerError } from '@/shared/api'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools buttonPosition='bottom-left' />
      )}
    </QueryClientProvider>
  )
}
