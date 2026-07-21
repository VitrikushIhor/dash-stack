'use client'

import { useEffect, useState } from 'react'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { toast } from 'sonner'
import {
  DirectionProvider,
  FontProvider,
  ThemeProvider,
} from '@/shared/lib/context'
import { handleServerError } from '@/shared/lib/handle-server-error'
import { Toaster } from '@/shared/ui/core/sonner'
import { TooltipProvider } from '@/shared/ui/core/tooltip'
import { useOrgStore } from '@/entities/organization'
import { useAuthStore } from '@/features/auth'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (_failureCount, _error) => {
              if (process.env.NODE_ENV === 'development') return false
              if (_failureCount > 3 && process.env.NODE_ENV === 'production')
                return false
              return true
            },
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            staleTime: 10 * 1000,
          },
          mutations: {
            onError: (error) => {
              handleServerError(error)
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            const err = error as { response?: { status?: number } }
            if (err?.response?.status === 401) {
              toast.error('Session expired!')
              useAuthStore.getState().logout()
              if (
                typeof window !== 'undefined' &&
                !window.location.pathname.startsWith('/sign-in')
              ) {
                window.location.href = '/sign-in'
              }
            }
          },
        }),
      })
  )

  useEffect(() => {
    useAuthStore.persist.rehydrate()
    useOrgStore.persist.rehydrate()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FontProvider>
          <DirectionProvider>
            <TooltipProvider>
              {children}
              <Toaster duration={5000} />
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools buttonPosition='bottom-left' />
              )}
            </TooltipProvider>
          </DirectionProvider>
        </FontProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
