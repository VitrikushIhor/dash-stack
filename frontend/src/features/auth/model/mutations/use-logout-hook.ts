'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import {
  AUTH_SESSION_EVENT_KIND,
  publishAuthSessionEvent,
} from '@/shared/lib/auth-session-events'
import { logoutAction } from '../../api/actions/logout.action'

export const useLogout = (): {
  isPending: boolean
  handleLogout: () => void
} => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    startTransition(async () => {
      const res = await logoutAction()

      queryClient.clear()
      publishAuthSessionEvent(AUTH_SESSION_EVENT_KIND.SIGNED_OUT)
      router.push(ROUTES.signIn)

      if (!res.success) {
        handleServerError(
          `Signed out on this device. Server logout could not be confirmed: ${res.error}`
        )

        return
      }

      toast.success(res.data.message)
    })
  }

  return {
    handleLogout,
    isPending,
  }
}
