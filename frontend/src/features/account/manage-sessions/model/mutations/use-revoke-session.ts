'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import {
  AUTH_SESSION_EVENT_KIND,
  publishAuthSessionEvent,
} from '@/shared/lib/auth-session-events'
import { revokeSessionAction } from '../../api/actions/revoke-session.action'

export function useRevokeSession() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()
  const router = useRouter()

  const resetError = () => setError(null)

  const revokeSession = (
    sessionId: string,
    onSuccess: () => void | Promise<void>
  ) => {
    if (isPending) return

    startTransition(async () => {
      resetError()

      try {
        const result = await revokeSessionAction(sessionId)

        if (!result.success) {
          setError(result.error)

          return
        }

        if (result.data.revokedCurrentSession) {
          queryClient.clear()
          publishAuthSessionEvent(AUTH_SESSION_EVENT_KIND.SIGNED_OUT)
          router.replace(ROUTES.signIn)
          router.refresh()

          return
        }

        await onSuccess()
        router.refresh()
      } catch (error: unknown) {
        setError(getErrorMessage(error))
      }
    })
  }

  return { revokeSession, isPending, error, resetError }
}
